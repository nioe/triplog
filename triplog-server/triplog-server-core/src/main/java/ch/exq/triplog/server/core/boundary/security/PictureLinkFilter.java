package ch.exq.triplog.server.core.boundary.security;

import ch.exq.triplog.server.common.dto.Step;
import ch.exq.triplog.server.common.dto.StepDetail;
import ch.exq.triplog.server.common.dto.Trip;
import ch.exq.triplog.server.core.control.controller.ResourceController;

import javax.inject.Inject;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.ext.Provider;
import java.io.IOException;

@Provider
public class PictureLinkFilter implements ContainerResponseFilter {

    @Context
    private UriInfo uriInfo;

    @Inject
    private ResourceController resourceController;

    @Override
    public void filter(final ContainerRequestContext requestContext, final ContainerResponseContext containerResponseContext) throws IOException {
        Object entity = containerResponseContext.getEntity();

        if (entity instanceof Trip) {
            changePictureLinkFor(((Trip) entity).getSteps());
        } else if (entity instanceof Iterable) {
            changePictureLinkFor((Iterable) entity);
        } else if (entity instanceof Step) {
            changePictureLinkFor((Step) entity);
        }
    }

    private void changePictureLinkFor(Iterable iterable) {
        for (Object entity : iterable) {
            if (entity instanceof Trip) {
                changePictureLinkFor(((Trip) entity).getSteps());
            } else if (entity instanceof Step) {
                changePictureLinkFor((Step) entity);
            }
        }
    }

    private void changePictureLinkFor(Step step) {
        String baseUri = uriInfo.getBaseUri().toString();

        if (step.getCoverPicture() != null) {
            step.setCoverPicture(baseUri + resourceController.getPictureUrl(step.getTripId(), step.getStepId(), step.getCoverPicture()));
        }

        if (step instanceof StepDetail) {
            StepDetail stepDetail = (StepDetail) step;
            stepDetail.getPictures().stream().forEach(picture -> picture.setUrl(baseUri + resourceController.getPictureUrl(step.getTripId(), step.getStepId(), picture.getName())));
        }
    }
}
