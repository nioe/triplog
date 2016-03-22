package ch.exq.triplog.server.tool.gpxparser;

import ch.exq.triplog.server.common.dto.GpsPoint;
import ch.exq.triplog.server.tool.gpxparser.gpx.GpxType;
import ch.exq.triplog.server.tool.gpxparser.gpx.TrkType;
import ch.exq.triplog.server.tool.gpxparser.gpx.TrksegType;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
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

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.*;

/**
 * User: Nicolas Oeschger <noe@exq.ch>
 * Date: 20.08.15
 * Time: 15:21
 */
public class GpxParser {

    public static final String GPX_PACKAGE = "ch.exq.triplog.server.tool.gpxparser.gpx";

    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Please provide path to GPX file as first argument!");
            System.exit(1);
        }

        File gpxFile = new File(args[0]);

        if (!gpxFile.exists()) {
            System.err.println("GPX File " + gpxFile.getAbsolutePath() + " could not be found!");
            System.exit(2);
        }

        System.out.println("Converting " + gpxFile.getAbsolutePath() + " to JSON...");

        GpxType root = getGpxRootNode(gpxFile);
        List<GpsPoint> gpsPoints = getGpsPoints(root);
        createJsonFile(gpxFile, gpsPoints);
    }


    private static GpxType getGpxRootNode(File gpxFile) {
        GpxType root = null;
        try {
            JAXBContext jc = JAXBContext.newInstance(GPX_PACKAGE);
            Unmarshaller unmarshaller = jc.createUnmarshaller();
            root = ((JAXBElement<GpxType>) unmarshaller.unmarshal(gpxFile)).getValue();
        } catch (JAXBException e) {
            System.err.println("Could not parse GPX file. Error: " + e.getMessage());
            System.exit(3);
        }

        return root;
    }

    private static List<GpsPoint> getGpsPoints(GpxType root) {
        List<GpsPoint> gpsPoints = new ArrayList<>();
        for (TrkType trk : root.getTrk()) {
            for (TrksegType trkseg : trk.getTrkseg()) {
                gpsPoints.addAll(trkseg.getTrkpt().stream().map(trkpt -> new GpsPoint(trkpt.getLat(), trkpt.getLon())).collect(Collectors.toList()));
            }
        }

        System.out.println("Parsed " + gpsPoints.size() + " GPS points.");

        return gpsPoints;
    }

    private static void createJsonFile(File gpxFile, List<GpsPoint> gpsPoints) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.setVisibilityChecker(
                mapper.getSerializationConfig().getDefaultVisibilityChecker()
                        .withFieldVisibility(ANY)
                        .withGetterVisibility(NONE)
                        .withSetterVisibility(NONE)
                        .withCreatorVisibility(NONE)
        );


        mapper.registerModule(new JaxbAnnotationModule());

        String parent = gpxFile.getParent();
        String jsonFileName = (parent != null ? parent + File.separator : "") + gpxFile.getName().substring(0, gpxFile.getName().lastIndexOf(".")) + ".json";

        try {
            mapper.writeValue(new File(jsonFileName), gpsPoints);
        } catch (IOException e) {
            System.err.println("Could not create JSON file. Error: " + e.getMessage());
            System.exit(4);
        }

        System.out.println("Successfully created JSON file: " + jsonFileName);
    }
}
