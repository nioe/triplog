package ch.exq.triplog.server.boundary.service;

import ch.exq.triplog.server.boundary.security.AuthenticationRequired;
import ch.exq.triplog.server.control.controller.LegController;
import ch.exq.triplog.server.control.exceptions.CreationException;
import ch.exq.triplog.server.dto.Leg;
import ch.exq.triplog.server.util.http.ResponseHelper;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Created by Nicolas Oeschger <noe@exq.ch> on 31.03.2014.
 */
@Path("/")
public class LegService {

    @Inject
    LegController legController;

    @GET
    @Path("/trip/{tripId : [0-9a-f]*}/leg/{legId : [0-9a-f]*}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getLeg(@PathParam("tripId") String tripId, @PathParam("legId") String legId) {
        Leg leg = legController.getLeg(tripId, legId);

        if (leg == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(leg).build();
    }

    @GET
    @Path("/trip/{tripId : [0-9a-f]*}/legs")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllLegsOfTrip(@PathParam("tripId") String tripId) {
        return Response.ok(legController.getAllLegsOfTrip(tripId)).build();
    }

    @POST
    @Path("/trip/{tripId : [0-9a-f]*}/leg")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @AuthenticationRequired
    public Response createLeg(@PathParam("tripId") String tripId, Leg leg) {
        leg.setTripId(tripId);

        try {
            return Response.ok(legController.createLeg(leg)).build();
        } catch (CreationException ex) {
            return ResponseHelper.badRequest(ex);
        }
    }

    @DELETE
    @Path("/trip/{tripId : [0-9a-f]*}/leg/{legId : [0-9a-f]*}")
    @AuthenticationRequired
    public Response deleteLeg(@PathParam("tripId") String tripId, @PathParam("legId") String legId) {
        boolean deleted = legController.deleteLeg(tripId, legId);

        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok().build();
    }
}
