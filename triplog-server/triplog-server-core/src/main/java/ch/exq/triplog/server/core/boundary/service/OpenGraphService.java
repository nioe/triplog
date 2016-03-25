package ch.exq.triplog.server.core.boundary.service;

import ch.exq.triplog.server.common.dto.StepDetail;
import ch.exq.triplog.server.common.dto.Trip;
import ch.exq.triplog.server.core.boundary.service.ogp.OgpIndex;
import ch.exq.triplog.server.core.control.controller.ResourceController;
import ch.exq.triplog.server.core.control.controller.StepController;
import ch.exq.triplog.server.core.control.controller.TripController;
import com.google.common.base.Strings;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.util.Arrays;
import java.util.List;

import static javax.ws.rs.core.MediaType.TEXT_HTML;

@Path("/ogp")
public class OpenGraphService {

    private static final String DEFAULT_TITLE = "Bros.pics";
    private static final String DEFAULT_DESCRIPTION = "Two guys who travel the world. Be part of our adventures!";
    private static final String DEFAULT_IMAGE = "/img/wallpapers/mountains.jpg";
    private TripController tripController;
    private StepController stepController;
    private ResourceController resourceController;

    public OpenGraphService() {
    }

    @Inject
    public OpenGraphService(final TripController tripController, final StepController stepController, final ResourceController resourceController) {
        this.tripController = tripController;
        this.stepController = stepController;
        this.resourceController = resourceController;
    }

    @GET
    @Produces(TEXT_HTML)
    public Response getOgpTaggedIndexFile(@QueryParam("path") final String path, @Context final UriInfo uriInfo) {
        return Response.ok(createOgpIndexFor(path, uriInfo)).build();
    }

    private String createOgpIndexFor(final String path, final UriInfo uriInfo) {
        if (Strings.isNullOrEmpty(path)) {
            return defaultOgpIndex(path, uriInfo);
        }

        final List<String> pathParts = Arrays.asList(path.replaceFirst("^/", "").split("/"));
        final String entryPoint = pathParts.get(0);

        if ("trips".equals(entryPoint) && pathParts.size() > 1) {
            final String tripId = pathParts.get(1);

            if (pathParts.size() == 3) {
                // Step
                final String stepId = pathParts.get(2);
                final StepDetail step = stepController.getStep(tripId, stepId, false);

                String image = "";
                if (step.getCoverPicture() != null) {
                    image = uriInfo.getAbsolutePathBuilder().replacePath("services/" + resourceController.getPictureUrl(tripId, stepId, step.getCoverPicture())).build().toString();
                }

                return new OgpIndex(getUrl(path, uriInfo), step.getStepName(), step.getStepLead(), image).toString();
            }

            // Trip
            final Trip trip = tripController.getTripById(tripId, false);

            String image = "";
            if (trip.getCoverPicture() != null) {
                image = trip.getCoverPicture().startsWith("http") ? trip.getCoverPicture() : uriInfo.getAbsolutePathBuilder().replacePath(trip.getCoverPicture()).build().toString();
            }

            return new OgpIndex(getUrl(path, uriInfo), trip.getTripName(), trip.getTripLead(), image).toString();
        }

        // Default
        return defaultOgpIndex(path, uriInfo);
    }

    private String defaultOgpIndex(String path, UriInfo uriInfo) {
        final String image = uriInfo.getAbsolutePathBuilder().replacePath(DEFAULT_IMAGE).build().toString();
        return new OgpIndex(getUrl(path, uriInfo), DEFAULT_TITLE, DEFAULT_DESCRIPTION, image).toString();
    }

    private String getUrl(final String path, final UriInfo uriInfo) {
        final String pathToUse = path == null || "/index.html".equals(path) ? "" : path;
        return uriInfo.getAbsolutePathBuilder().replacePath(pathToUse).build().toString();
    }
}
