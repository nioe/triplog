package ch.exq.triplog.server.service;

import ch.exq.triplog.server.entity.dto.Leg;
import ch.exq.triplog.server.entity.dao.LegDAO;
import ch.exq.triplog.server.entity.exceptions.CreationException;
import ch.exq.triplog.server.service.security.AuthenticationRequired;
import ch.exq.triplog.server.util.ResponseHelper;

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
    LegDAO legDAO;

    @GET
    @Path("/trip/{tripId : [0-9a-f]*}/leg/{legId : [0-9a-f]*}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getLeg(@PathParam("tripId") String tripId, @PathParam("legId") String legId) {
        Leg leg = legDAO.getLeg(tripId, legId);

        if (leg == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(leg).build();
    }

    @GET
    @Path("/trip/{tripId : [0-9a-f]*}/legs")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllLegsOfTrip(@PathParam("tripId") String tripId) {
        return Response.ok(legDAO.getAllLegsOfTrip(tripId)).build();
    }

    @POST
    @Path("/trip/{tripId : [0-9a-f]*}/leg")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @AuthenticationRequired
    public Response createLeg(@PathParam("tripId") String tripId, Leg leg) {
        leg.setTripId(tripId);

        try {
            return Response.ok(legDAO.createLeg(leg)).build();
        } catch (CreationException ex) {
            return ResponseHelper.badRequest(ex);
        }
    }
}
