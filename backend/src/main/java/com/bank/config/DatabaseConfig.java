package com.bank.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Production DataSource configuration supporting:
 * 1. Standard JDBC URLs (jdbc:postgresql://host:5432/db)
 * 2. Cloud PaaS DATABASE_URL strings (postgres://user:pass@host:port/db or postgresql://...)
 *    commonly provided by Render, Neon, Supabase, Railway, Heroku, and AWS RDS.
 */
@Slf4j
@Configuration
@Profile("prod")
public class DatabaseConfig {

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${SPRING_DATASOURCE_URL:#{null}}")
    private String springDatasourceUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:postgres}")
    private String username;

    @Value("${SPRING_DATASOURCE_PASSWORD:postgres}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        String rawUrl = (databaseUrl != null && !databaseUrl.isBlank()) ? databaseUrl : springDatasourceUrl;

        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = "jdbc:postgresql://localhost:5432/bankdb";
        }

        HikariConfig config = new HikariConfig();

        // Check if rawUrl is a postgres:// or postgresql:// URI format
        if (rawUrl.startsWith("postgres://") || (rawUrl.startsWith("postgresql://") && !rawUrl.startsWith("jdbc:"))) {
            try {
                String normalized = rawUrl.startsWith("postgres://")
                        ? "postgresql://" + rawUrl.substring("postgres://".length())
                        : rawUrl;
                URI uri = new URI(normalized);

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    config.setUsername(userInfo[0]);
                    if (userInfo.length > 1) {
                        config.setPassword(userInfo[1]);
                    }
                } else {
                    config.setUsername(username);
                    config.setPassword(password);
                }

                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                if (path != null && path.startsWith("/")) {
                    path = path.substring(1);
                }

                StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                        .append(uri.getHost())
                        .append(":")
                        .append(port)
                        .append("/")
                        .append(path);

                if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
                    jdbcUrl.append("?").append(uri.getQuery());
                } else {
                    // Cloud PostgreSQL hosts usually mandate SSL
                    jdbcUrl.append("?sslmode=require");
                }

                log.info("Configured PostgreSQL DataSource from Cloud URI for host: {}:{}", uri.getHost(), port);
                config.setJdbcUrl(jdbcUrl.toString());
            } catch (Exception e) {
                log.warn("Failed to parse PostgreSQL URI ({}), falling back to raw JDBC format: {}", rawUrl, e.getMessage());
                config.setJdbcUrl(rawUrl.startsWith("jdbc:") ? rawUrl : "jdbc:" + rawUrl);
                config.setUsername(username);
                config.setPassword(password);
            }
        } else {
            config.setJdbcUrl(rawUrl);
            config.setUsername(username);
            config.setPassword(password);
        }

        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);

        return new HikariDataSource(config);
    }
}
