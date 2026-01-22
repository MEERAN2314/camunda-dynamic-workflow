package com.dynamicworkflow.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Ensure static resources are served correctly
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0); // Disable caching for development
        
        // Specific handler for CSS files
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/")
                .setCachePeriod(0);
        
        // Specific handler for JS files
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/")
                .setCachePeriod(0);
    }
}