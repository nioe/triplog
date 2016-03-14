package ch.exq.triplog.server.core.control.controller;

import ch.exq.triplog.server.common.comparator.StepFromDateComparator;
import ch.exq.triplog.server.common.dto.Picture;
import ch.exq.triplog.server.common.dto.Step;
import ch.exq.triplog.server.common.dto.StepDetail;
import ch.exq.triplog.server.common.dto.StepMin;
import ch.exq.triplog.server.core.control.exceptions.DisplayableException;
import ch.exq.triplog.server.core.entity.dao.PictureDAO;
import ch.exq.triplog.server.core.entity.dao.StepDAO;
import ch.exq.triplog.server.core.entity.dao.TripDAO;
import ch.exq.triplog.server.core.entity.db.PictureDBObject;
import ch.exq.triplog.server.core.entity.db.StepDBObject;
import ch.exq.triplog.server.core.mapper.TriplogMapper;
import ch.exq.triplog.server.util.id.IdGenerator;
import com.mongodb.WriteResult;
import org.slf4j.Logger;

import javax.inject.Inject;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;

import static ch.exq.triplog.server.core.control.controller.filter.PublishedChecker.shouldBeShown;
import static java.util.stream.Collectors.toList;

public class StepController {

    private Logger logger;
    private TripDAO tripDAO;
    private StepDAO stepDAO;
    private PictureDAO pictureDAO;
    private TriplogMapper mapper;

    @Inject
    public StepController(Logger logger, TripDAO tripDAO, StepDAO stepDAO, PictureDAO pictureDAO, TriplogMapper mapper) {
        this.logger = logger;
        this.tripDAO = tripDAO;
        this.stepDAO = stepDAO;
        this.pictureDAO = pictureDAO;
        this.mapper = mapper;
    }

    public List<Step> getAllStepsOfTrip(String tripId, boolean isAuthenticatedUser) {
        if (tripDAO.getTripById(tripId) == null) {
            return null;
        }

        List<Step> allStepsOfTrip = stepDAO.getAllStepsOfTrip(tripId).stream()
                .map(stepDBObject -> mapper.map(stepDBObject, Step.class))
                .filter(step -> shouldBeShown(step, isAuthenticatedUser))
                .collect(toList());
        allStepsOfTrip.sort(new StepFromDateComparator());

        return allStepsOfTrip;
    }

    public StepDetail getStep(String tripId, String stepId, boolean isAuthenticatedUser) {
        StepDBObject stepDBObject = stepDAO.getStep(tripId, stepId);
        StepDetail stepDetail = null;

        if (stepDBObject != null && shouldBeShown(stepDBObject, isAuthenticatedUser)) {
            stepDetail = mapper.map(stepDBObject, StepDetail.class);
            findPreviousAndNext(stepDetail, isAuthenticatedUser);
        }

        return stepDetail;
    }

    public StepDetail createStep(final StepDetail stepDetail) throws DisplayableException {
        String tripId = stepDetail.getTripId();
        if (tripId == null || tripDAO.getTripById(tripId) == null) {
            throw new DisplayableException("Could not find trip with id " + tripId);
        }

        if (stepDetail.getStepName() == null || stepDetail.getStepName().isEmpty()) {
            throw new DisplayableException("Step incomplete: stepName must be set");
        }

        if (stepDetail.getFromDate() == null || stepDetail.getToDate() == null) {
            throw new DisplayableException("Step incomplete: fromDate and toDate must be set");
        }

        String stepId = IdGenerator.generateIdWithFullDate(stepDetail.getStepName(), stepDetail.getFromDate());
        stepDetail.setStepId(stepId);

        // We never update created and updated timestamps here
        stepDetail.setCreated(null);
        stepDetail.setLastUpdated(null);

        StepDBObject stepDBObject = mapper.map(stepDetail, StepDBObject.class);
        checkFromDateIsBeforeOrEqualsToDate(stepDBObject);

        //We never add images directly
        stepDBObject.setCoverPicture(null);
        stepDBObject.setPictures(null);

        stepDAO.createStep(stepDBObject);

        return mapper.map(stepDAO.getStep(tripId, stepId), StepDetail.class);
    }

    public StepDetail updateStep(String tripId, String stepId, StepDetail stepDetail) throws DisplayableException {
        StepDBObject currentStep = getStepOrThrowException(tripId, stepId);
        StepDBObject changedStep = mapper.map(stepDetail, StepDBObject.class);

        //We never change ids, created and updated timestamps here
        changedStep.setStepId(null);
        changedStep.setTripId(null);
        stepDetail.setCreated(null);
        stepDetail.setLastUpdated(null);

        List<PictureDBObject> pictures = updatePictures(currentStep, changedStep);

        try {
            currentStep.updateFrom(changedStep);
        } catch (InvocationTargetException | IllegalAccessException e) {
            String message = "Step could not be updated";
            logger.warn(message, e);
            throw new DisplayableException(message, e);
        }

        currentStep.setPictures(pictures);

        checkFromDateIsBeforeOrEqualsToDate(currentStep);
        stepDAO.updateStep(tripId, stepId, currentStep);

        return getStep(tripId, stepId, true);
    }

    public StepDetail addPicture(String tripId, String stepId, Picture picture) throws DisplayableException {
        StepDBObject step = getStepOrThrowException(tripId, stepId);

        List<PictureDBObject> existingPictures = step.getPictures();
        existingPictures.add(mapper.map(picture, PictureDBObject.class));
        step.setPictures(existingPictures);
        stepDAO.updateStep(tripId, stepId, step);

        return mapper.map(step, StepDetail.class);
    }

    public StepDetail deletePicture(String tripId, String stepId, String pictureName) throws DisplayableException {
        StepDBObject step = getStepOrThrowException(tripId, stepId);

        List<PictureDBObject> pictureToDelete = step.getPictures().stream().filter(picture -> picture.getName().equals(pictureName)).collect(toList());
        if (pictureToDelete.size() > 1) {
            throw new IllegalArgumentException("More than one picture with ID " + pictureName + " found on step " + stepId + " of trip " + tripId);
        } else if (pictureToDelete.size() == 1) {
            List<PictureDBObject> updatedPictures = step.getPictures();
            updatedPictures.remove(pictureToDelete.get(0));
            step.setPictures(updatedPictures);

            if (pictureName.equals(step.getCoverPicture())) {
                step.setCoverPicture(null);
            }

            stepDAO.updateStep(tripId, stepId, step);
        } else {
            throw new DisplayableException("No picture with ID " + pictureName + " found on step " + stepId + " of trip " + tripId);
        }

        return mapper.map(step, StepDetail.class);
    }

    public boolean deleteStep(String tripId, String stepId) {
        StepDBObject stepDBObject = stepDAO.getStep(tripId, stepId);
        if (stepDBObject == null) {
            return false;
        }

        WriteResult result = stepDAO.deleteStep(stepDBObject);
        boolean deleted = result.getN() == 1 && result.getError() == null;

        if (deleted) {
            deleteAllPicturesOfStep(stepDBObject);
        }

        return deleted;
    }

    private void deleteAllPicturesOfStep(StepDBObject stepDBObject) {
        stepDBObject.getPictures().stream().forEach(picture -> {
            try {
                pictureDAO.deletePicture(stepDBObject.getTripId(), stepDBObject.getStepId(), picture.getName());
            } catch (IOException e) {
                logger.error("Could not delete picture while deleting step", e);
            }
        });
    }

    public boolean deleteAllStepsOfTrip(String tripId) {
        List<StepDBObject> allStepsOfTrip = stepDAO.getAllStepsOfTrip(tripId);

        WriteResult result = stepDAO.deleteAllStepsOfTrip(tripId);
        boolean deleted = result.getN() > 0 && result.getError() == null;

        if (deleted) {
            allStepsOfTrip.stream().forEach(this::deleteAllPicturesOfStep);
        }

        return deleted;
    }

    private void findPreviousAndNext(StepDetail stepDetail, boolean isAuthenticatedUser) {
        List<Step> allStepsOfTrip = getAllStepsOfTrip(stepDetail.getTripId(), isAuthenticatedUser);
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

    private StepDBObject getStepOrThrowException(String tripId, String stepId) throws DisplayableException {
        StepDBObject currentStep = stepDAO.getStep(tripId, stepId);
        if (currentStep == null) {
            throw new DisplayableException("Step " + stepId + " could not be found");
        }

        return currentStep;
    }

    private List<PictureDBObject> updatePictures(StepDBObject currentStep, StepDBObject changedStep) throws DisplayableException {
        List<PictureDBObject> changedPictures = changedStep.getPictures();
        if (changedPictures != null) {
            List<PictureDBObject> pictures = new ArrayList<>();

            for (PictureDBObject currentPicture : currentStep.getPictures()) {
                List<PictureDBObject> matchingChangedPictures = changedPictures.stream().filter(candidate -> candidate.getName().equals(currentPicture.getName())).collect(toList());
                if (matchingChangedPictures.size() > 1) {
                    throw new DisplayableException("More than one picture with name " + currentPicture.getName() + " found.");
                } else if (matchingChangedPictures.size() == 1) {
                    PictureDBObject changedPicture = matchingChangedPictures.get(0);
                    pictures.add(new PictureDBObject(
                            currentPicture.getName(),
                            currentPicture.getLocation(),
                            changedPicture.getCaption(),
                            changedPicture.getCaptureDate(),
                            currentPicture.getWidth(),
                            currentPicture.getHeight(),
                            changedPicture.isShownInGallery()));
                } else {
                    pictures.add(currentPicture);
                }
            }

            return pictures;
        }

        return new ArrayList<>(currentStep.getPictures());
    }
}
