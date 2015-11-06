package ch.exq.triplog.server.core.control.controller;

import ch.exq.triplog.server.common.comparator.StepFromDateComparator;
import ch.exq.triplog.server.common.dto.Step;
import ch.exq.triplog.server.common.dto.StepDetail;
import ch.exq.triplog.server.common.dto.StepMin;
import ch.exq.triplog.server.core.control.exceptions.DisplayableException;
import ch.exq.triplog.server.core.entity.dao.StepDAO;
import ch.exq.triplog.server.core.entity.dao.TripDAO;
import ch.exq.triplog.server.core.entity.db.StepDBObject;
import ch.exq.triplog.server.core.mapper.TriplogMapper;
import ch.exq.triplog.server.util.id.IdGenerator;
import com.mongodb.WriteResult;
import org.slf4j.Logger;

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

    @Inject
    Logger logger;

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

        List<Step> allStepDetails = stepDAO.getAllStepsOfTrip(tripId).stream().map(stepDBObject -> mapper.map(stepDBObject, Step.class))
                .collect(Collectors.toList());

        //allStepDetails.forEach(this::changePictureLinksFor);

        return allStepDetails;
    }

    public StepDetail getStep(String tripId, String stepId) {
        StepDBObject stepDBObject = stepDAO.getStep(tripId, stepId);
        StepDetail stepDetail = null;

        if (stepDBObject != null) {
            stepDetail = mapper.map(stepDBObject, StepDetail.class);
            //changePictureLinksFor(stepDetail);
            findPreviousAndNext(stepDetail);
        }

        return stepDetail;
    }

    public StepDetail createStep(final StepDetail stepDetail) throws DisplayableException {
        if (stepDetail.getTripId() == null || tripDAO.getTripById(stepDetail.getTripId()) == null) {
            throw new DisplayableException("Could not find trip with id " + stepDetail.getTripId());
        }

        if (stepDetail.getStepName() == null || stepDetail.getStepName().isEmpty()) {
            throw new DisplayableException("Step incomplete: stepName must be set");
        }

        if (stepDetail.getFromDate() == null || stepDetail.getToDate() == null) {
            throw new DisplayableException("Step incomplete: fromDate and toDate must be set");
        }

        stepDetail.setStepId(IdGenerator.generateIdWithFullDate(stepDetail.getStepName(), stepDetail.getFromDate()));

        StepDBObject stepDBObject = mapper.map(stepDetail, StepDBObject.class);
        checkFromDateIsBeforeOrEqualsToDate(stepDBObject);

        //We never add images directly
        stepDBObject.setCoverPicture(null);
        stepDBObject.setPictures(null);

        stepDAO.createStep(stepDBObject);

        return mapper.map(stepDBObject, StepDetail.class);
    }

    public StepDetail updateStep(String tripId, String stepId, StepDetail stepDetail) throws DisplayableException {
        StepDBObject currentStep = stepDAO.getStep(tripId, stepId);
        if (currentStep == null) {
            throw new DisplayableException("Step " + stepId + " could not be found");
        }

        StepDBObject changedStep = mapper.map(stepDetail, StepDBObject.class);

        //We never change ids or images like this
        changedStep.setStepId(null);
        changedStep.setTripId(null);
        changedStep.setPictures(null);

        try {
            currentStep.updateFrom(changedStep);
        } catch (InvocationTargetException | IllegalAccessException e) {
            String message = "Step could not be updated";
            logger.warn(message, e);
            throw new DisplayableException(message, e);
        }

        checkFromDateIsBeforeOrEqualsToDate(currentStep);
        stepDAO.updateStep(tripId, stepId, currentStep);

        StepDetail updatedStep = mapper.map(currentStep, StepDetail.class);
        //changePictureLinksFor(updatedStep);

        return updatedStep;
    }

    public boolean deleteStep(String tripId, String stepId) {
        StepDBObject stepDBObject = stepDAO.getStep(tripId, stepId);
        if (stepDBObject == null) {
            return false;
        }

        WriteResult result = stepDAO.deleteStep(stepDBObject);
        return result.getN() == 1 && result.getError() == null;
    }

    public boolean deleteAllStepsOfTrip(String tripId) {
        WriteResult result = stepDAO.deleteAllStepsOfTrip(tripId);
        return result.getN() > 0 && result.getError() == null;
    }

    private void changePictureLinksFor(Step step) {
        if (step.getCoverPicture() != null) {
            step.setCoverPicture(resourceController.getPictureUrl(step.getTripId(), step.getTripId(), step.getCoverPicture()));
        }

        if (step instanceof StepDetail) {
            StepDetail stepDetail = (StepDetail) step;
            stepDetail.setPictures(stepDetail.getPictures().stream()
                    .map(picture -> resourceController.getPictureUrl(step.getTripId(), step.getTripId(), picture))
                    .collect(Collectors.toList()));
        }
    }

    private void findPreviousAndNext(StepDetail stepDetail) {
        List<Step> allStepsOfTrip = getAllStepsOfTrip(stepDetail.getTripId());
        allStepsOfTrip.sort(new StepFromDateComparator());

        int index = allStepsOfTrip.indexOf(stepDetail);
        int prevIndex = index - 1;
        int nextIndex = index + 1;

        stepDetail.setPreviousStep(prevIndex >= 0 && prevIndex < allStepsOfTrip.size() ? new StepMin(allStepsOfTrip.get(prevIndex)) : null);
        stepDetail.setNextStep(nextIndex >= 0 && nextIndex < allStepsOfTrip.size() ? new StepMin(allStepsOfTrip.get(nextIndex)) : null);
    }

    private void checkFromDateIsBeforeOrEqualsToDate(StepDBObject stepDBObject) throws DisplayableException {
        if (!(stepDBObject.getFromDate().isBefore(stepDBObject.getToDate()) || stepDBObject.getFromDate().isEqual(stepDBObject.getToDate()))) {
            throw new DisplayableException("FromDate has to be before or equal toDate");
        }
    }
}
