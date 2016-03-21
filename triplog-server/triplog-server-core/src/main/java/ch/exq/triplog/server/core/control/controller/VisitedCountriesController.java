package ch.exq.triplog.server.core.control.controller;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class VisitedCountriesController {

    private StepController stepController;

    @Inject
    public VisitedCountriesController(StepController stepController) {
        this.stepController = stepController;
    }

    public List<List<Object>> getVisitedCountries(boolean isAuthenticatedUser) {
        List<List<Object>> visitedCountries = new ArrayList<>();

        stepController.getVisitedCountriesOfAllSteps(isAuthenticatedUser).forEach(
                (country, count) -> visitedCountries.add(Arrays.asList(country, count))
        );

        return visitedCountries;
    }
}
