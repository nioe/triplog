package ch.exq.triplog.server.common.comparator;

import ch.exq.triplog.server.common.dto.Step;

import java.util.Comparator;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 28.10.15
 * Time: 17:39
 */
public class StepFromDateComparator implements Comparator<Step> {

    @Override
    public int compare(Step o1, Step o2) {
        if (o1 == null && o2 == null) {
            return 0;
        } else if (o1 == null) {
            return 1;
        } else if (o2 == null) {
            return -1;
        } else {
            return o1.getFromDate().compareTo(o2.getFromDate());
        }
    }
}
