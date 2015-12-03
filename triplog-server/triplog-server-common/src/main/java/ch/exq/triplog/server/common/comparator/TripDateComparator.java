package ch.exq.triplog.server.common.comparator;

import ch.exq.triplog.server.common.dto.Trip;

import java.util.Comparator;

public class TripDateComparator implements Comparator<Trip> {

    @Override
    public int compare(Trip o1, Trip o2) {
        if (o1 == null && o2 == null) {
            return 0;
        } else if (o1 == null) {
            return 1;
        } else if (o2 == null) {
            return -1;
        } else {
            return o1.getTripDate().compareTo(o2.getTripDate());
        }
    }
}
