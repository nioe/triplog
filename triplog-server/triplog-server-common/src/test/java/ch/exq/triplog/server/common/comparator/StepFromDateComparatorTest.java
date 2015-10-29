package ch.exq.triplog.server.common.comparator;

import ch.exq.triplog.server.common.dto.Step;
import org.assertj.core.api.Assertions;
import org.junit.Test;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 29.10.15
 * Time: 07:08
 */
public class StepFromDateComparatorTest {

    private int stepIdCounter = 1;

    @Test
    public void should_sort_steps_by_from_date_correctly() {
        // given
        Step step1 = createStep(LocalDate.of(2015, 1, 1));
        Step step2 = createStep(LocalDate.of(2015, 2, 1));
        Step step3 = createStep(LocalDate.of(2015, 3, 1));

        List<Step> steps = Arrays.asList(step3, step1, step2);

        // when
        steps.sort(new StepFromDateComparator());

        // then
        Assertions.assertThat(steps).containsExactly(step1, step2, step3);
    }

    @Test
    public void should_place_null_values_at_the_end() {
        // given
        Step step1 = createStep(LocalDate.of(2015, 1, 1));
        Step step2 = null;
        Step step3 = null;

        List<Step> steps = Arrays.asList(step3, step1, step2);

        // when
        steps.sort(new StepFromDateComparator());

        // then
        Assertions.assertThat(steps).containsExactly(step1, null, null);
    }

    private Step createStep(LocalDate fromDate) {
        return new Step(
                "stepId" + stepIdCounter++,
                "tripId",
                "stepName",
                fromDate,
                fromDate,
                "stepLead",
                "coverPicture"
        );
    }
}