package com.gym360.config;

import com.gym360.dto.ErrorResponse;
import com.gym360.dto.MessageResponse;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI fitcoreOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FITCORE API Documentation")
                        .description("FITCORE Multi-Tenant SaaS Gym Management Platform REST APIs with Admin & Client roles")
                        .version("2.0.0")
                        .contact(new Contact().name("FITCORE Support").email("support@fitcore.io")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT Bearer token obtained from /api/auth/login or /api/auth/register-gym")));
    }

    @Bean
    public OpenApiCustomizer globalOpenApiCustomizer() {
        return openApi -> {
            Content errorContent = new Content().addMediaType(
                    org.springframework.http.MediaType.APPLICATION_JSON_VALUE,
                    new MediaType().schema(new Schema<ErrorResponse>().$ref("#/components/schemas/ErrorResponse"))
            );

            ApiResponse badRequestResponse = new ApiResponse()
                    .description("Bad Request - Validation failure or business rule violation")
                    .content(errorContent);

            ApiResponse unauthorizedResponse = new ApiResponse()
                    .description("Unauthorized - Missing, invalid, or expired JWT Bearer token")
                    .content(errorContent);

            ApiResponse forbiddenResponse = new ApiResponse()
                    .description("Forbidden - Insufficient role permissions or deactivated account")
                    .content(errorContent);

            ApiResponse notFoundResponse = new ApiResponse()
                    .description("Not Found - Requested entity or record does not exist")
                    .content(errorContent);

            ApiResponse serverErrorResponse = new ApiResponse()
                    .description("Internal Server Error - Unexpected server error")
                    .content(errorContent);

            if (openApi.getPaths() != null) {
                openApi.getPaths().forEach((pathName, pathItem) -> {
                    pathItem.readOperations().forEach(operation -> {
                        ApiResponses responses = operation.getResponses();
                        if (responses == null) {
                            responses = new ApiResponses();
                            operation.setResponses(responses);
                        }

                        if (!responses.containsKey("400")) {
                            responses.addApiResponse("400", badRequestResponse);
                        }
                        if (!responses.containsKey("401")) {
                            responses.addApiResponse("401", unauthorizedResponse);
                        }
                        if (!responses.containsKey("403")) {
                            responses.addApiResponse("403", forbiddenResponse);
                        }
                        if (!responses.containsKey("404")) {
                            responses.addApiResponse("404", notFoundResponse);
                        }
                        if (!responses.containsKey("500")) {
                            responses.addApiResponse("500", serverErrorResponse);
                        }

                        // Public endpoints do not require authorization in Swagger UI
                        if (pathName.equals("/api/auth/login") ||
                            pathName.equals("/api/auth/register-gym") ||
                            pathName.equals("/api/auth/forgot-password") ||
                            pathName.equals("/api/auth/reset-password") ||
                            pathName.equals("/api/auth/register-admin")) {
                            operation.setSecurity(Collections.emptyList());
                        }
                    });
                });
            }
        };
    }
}
