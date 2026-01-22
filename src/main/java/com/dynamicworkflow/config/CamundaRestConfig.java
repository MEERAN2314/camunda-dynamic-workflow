package com.dynamicworkflow.config;

import org.camunda.bpm.engine.rest.filter.EmptyBodyFilter;
import org.camunda.bpm.engine.rest.filter.CacheControlFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CamundaRestConfig {

    @Bean
    public FilterRegistrationBean<EmptyBodyFilter> emptyBodyFilter() {
        FilterRegistrationBean<EmptyBodyFilter> filterRegistration = new FilterRegistrationBean<>();
        filterRegistration.setFilter(new EmptyBodyFilter());
        filterRegistration.addUrlPatterns("/engine-rest/*");
        filterRegistration.setName("Empty Body Filter");
        filterRegistration.setOrder(1);
        return filterRegistration;
    }

    @Bean
    public FilterRegistrationBean<CacheControlFilter> cacheControlFilter() {
        FilterRegistrationBean<CacheControlFilter> filterRegistration = new FilterRegistrationBean<>();
        filterRegistration.setFilter(new CacheControlFilter());
        filterRegistration.addUrlPatterns("/engine-rest/*");
        filterRegistration.setName("Cache Control Filter");
        filterRegistration.setOrder(2);
        return filterRegistration;
    }
}