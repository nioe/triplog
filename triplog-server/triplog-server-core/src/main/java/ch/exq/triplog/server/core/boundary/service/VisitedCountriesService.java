package ch.exq.triplog.server.core.boundary.service;

import ch.exq.triplog.server.core.boundary.security.AuthTokenHandler;
import ch.exq.triplog.server.core.control.controller.VisitedCountriesController;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

@Path("/visited-countries")
public class VisitedCountriesService {

    private static final String X_AUTH_TOKEN = "X-AUTH-TOKEN";

    private VisitedCountriesController visitedCountriesController;
    private AuthTokenHandler authTokenHandler;

    @Inject
    public VisitedCountriesService(VisitedCountriesController visitedCountriesController, AuthTokenHandler authTokenHandler) {
        this.visitedCountriesController = visitedCountriesController;
        this.authTokenHandler = authTokenHandler;
    }

    public VisitedCountriesService() {}

    @GET
    @Produces(APPLICATION_JSON)
    public Response getVisitedCountries(@HeaderParam(X_AUTH_TOKEN) String xAuthToken) {
        return Response.ok(visitedCountriesController.getVisitedCountries(authTokenHandler.isValidToken(xAuthToken, true))).build();
    }
}
