package ch.exq.triplog.server.tool.gpxparser;

import ch.exq.triplog.server.common.dto.GpsPoint;
import ch.exq.triplog.server.tool.gpxparser.gpx.GpxType;
import ch.exq.triplog.server.tool.gpxparser.gpx.TrkType;
import ch.exq.triplog.server.tool.gpxparser.gpx.TrksegType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.module.jaxb.JaxbAnnotationModule;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBElement;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 20.08.15
 * Time: 15:21
 */
public class GpxParser {

    public static final String GPX_PACKAGE = "ch.exq.triplog.server.tool.gpxparser.gpx";

    public static void main(String[] args) throws JAXBException, IOException {
        if (args.length == 0) {
            System.err.println("Please provide path to GPX file as first argument!");
            System.exit(1);
        }

        File gpxFile = new File(args[0]);

        JAXBContext jc = JAXBContext.newInstance(GPX_PACKAGE);
        Unmarshaller unmarshaller = jc.createUnmarshaller();

        GpxType root = ((JAXBElement<GpxType>) unmarshaller.unmarshal(gpxFile)).getValue();

        List<GpsPoint> gpsPoints = new ArrayList<>();
        for (TrkType trk : root.getTrk()) {
            for (TrksegType trkseg : trk.getTrkseg()) {
                gpsPoints.addAll(trkseg.getTrkpt().stream().map(trkpt -> new GpsPoint(trkpt.getLat(), trkpt.getLon())).collect(Collectors.toList()));
            }
        }

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JaxbAnnotationModule());

        String jsonFileName = gpxFile.getParent() + File.separator + gpxFile.getName().substring(0, gpxFile.getName().lastIndexOf(".")) + ".json";
        System.out.println(jsonFileName);

        mapper.writeValue(new File(jsonFileName), gpsPoints);
    }
}
