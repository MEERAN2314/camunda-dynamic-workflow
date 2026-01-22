package com.dynamicworkflow.config;

import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.ProcessEngineConfiguration;
import org.camunda.bpm.engine.impl.cfg.StandaloneProcessEngineConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class CamundaConfig {

    @Bean
    public ProcessEngineConfiguration processEngineConfiguration(DataSource dataSource) {
        StandaloneProcessEngineConfiguration config = new StandaloneProcessEngineConfiguration();
        config.setDataSource(dataSource);
        config.setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_TRUE);
        config.setJobExecutorActivate(false);
        config.setHistory(ProcessEngineConfiguration.HISTORY_FULL);
        return config;
    }
}