package ch.exq.triplog.server.core.control.controller;

import ch.exq.triplog.server.core.control.exceptions.DisplayableException;
import ch.exq.triplog.server.core.dto.Step;
import ch.exq.triplog.server.core.entity.dao.StepDAO;
import ch.exq.triplog.server.core.entity.dao.TripDAO;
import ch.exq.triplog.server.core.entity.db.StepDBObject;
import ch.exq.triplog.server.core.entity.db.TripDBObject;
import ch.exq.triplog.server.core.util.mapper.TriplogMapper;
import ch.exq.triplog.server.core.util.mongodb.MongoDbUtil;
import com.mongodb.WriteResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.Stateless;
import javax.inject.Inject;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 25.04.14
 * Time: 15:58
 */
@Stateless
public class StepController {

    private static final Logger logger = LoggerFactory.getLogger(StepController.class);

    @Inject
    TripDAO tripDAO;

    @Inject
    StepDAO stepDAO;

    @Inject
    ResourceController resourceController;

    @Inject
    TriplogMapper mapper;


    public List<Step> getAllStepsOfTrip(String tripId) {
        if (tripDAO.getTripById(tripId) == null) {
            return null;
        }

        List<Step> allSteps = stepDAO.getAllStepsOfTrip(tripId).stream().map(stepDBObject -> mapper.map(stepDBObject, Step.class))
                .collect(Collectors.toList());

        allSteps.forEach(l -> changeImageLinksFor(l));

        return allSteps;
    }

    public Step getStep(String tripId, String stepId) {
        if (!doesTripContainsStep(tripId, stepId)) return null;

        StepDBObject stepDBObject = stepDAO.getStep(stepId);
        return stepDBObject != null ? changeImageLinksFor(mapper.map(stepDBObject, Step.class)) : null;
    }

    public Step createStep(Step step) throws DisplayableException {
        if (step.getTripId() == null || tripDAO.getTripById(step.getTripId()) == null) {
            throw new DisplayableException("Could not find trip with id " + step.getTripId());
        }

        if (step == null || step.getStepName() == null || step.getStepName().isEmpty()) {
            throw new DisplayableException("Step incomplete: stepName must be set");
        }

        StepDBObject stepDBObject = mapper.map(step, StepDBObject.class);

        //We never add images directly
        stepDBObject.setImages(null);

        stepDAO.createStep(stepDBObject);

        tripDAO.addStepToTrip(stepDBObject.getTripId(), stepDBObject.getStepId());

        return changeImageLinksFor(mapper.map(stepDBObject, Step.class));
    }

    public Step updateStep(String tripId, String stepId, Step step) throws DisplayableException {
        if (!doesTripContainsStep(tripId, stepId)) {
            throw new DisplayableException("Either trip " + tripId + " could not be found or it does not contain step " + stepId);
        }

        StepDBObject currentStep = stepDAO.getStep(stepId);
        if (currentStep == null) {
            throw new DisplayableException("Step " + stepId + " could not be found");
        }

        StepDBObject changedStep = mapper.map(step, StepDBObject.class);

        //We never change ids or images like this
        changedStep.setStepId(null);
        changedStep.setTripId(null);
        changedStep.setImages(null);

        try {
            currentStep.updateFrom(changedStep);
        } catch (InvocationTargetException | IllegalAccessException e) {
            String message = "Step could not be updated";
            logger.warn(message, e);
            throw new DisplayableException(message, e);
        }

        stepDAO.updateStep(stepId, currentStep);

        return changeImageLinksFor(mapper.map(currentStep, Step.class));
    }

    public boolean deleteStep(String tripId, String stepId) {
        if (!doesTripContainsStep(tripId, stepId)) return false;

        StepDBObject stepDBObject = stepDAO.getStep(stepId);
        if (stepDBObject == null) {
            return false;
        }

        tripDAO.removeStepFromTrip(tripId, stepId);

        WriteResult result = stepDAO.deleteStep(stepDBObject);
        return result.getN() == 1 && result.getError() == null;
    }

    private boolean doesTripContainsStep(String tripId, String stepId) {
        if (!MongoDbUtil.isValidObjectId(tripId, stepId)) {
            return false;
        }

        TripDBObject trip = tripDAO.getTripById(tripId);
        if (trip == null || !trip.getSteps().contains(stepId)) {
            return false;
        }

        return true;
    }

    private Step changeImageLinksFor(Step step) {
        step.setImages(step.getImages().stream().map(imageId -> resourceController.getImageUrl(imageId))
                .collect(Collectors.toList()));

        return step;
    }
}
