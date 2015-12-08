package ch.exq.triplog.server.util.picture;


import com.drew.metadata.Metadata;
import com.drew.metadata.MetadataException;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.gif.GifHeaderDirectory;
import com.drew.metadata.jpeg.JpegDirectory;
import com.drew.metadata.png.PngDirectory;

public class PictureSize {

    private final int width;
    private final int height;

    public static PictureSize valueOf(final Metadata metadata) {
        if (metadata == null) {
            return null;
        }

        try {
            final JpegDirectory jpegDirectory = metadata.getFirstDirectoryOfType(JpegDirectory.class);
            if (jpegDirectory != null) {
                return new PictureSize(jpegDirectory.getImageWidth(), jpegDirectory.getImageHeight());
            }

            final PngDirectory pngDirectory = metadata.getFirstDirectoryOfType(PngDirectory.class);
            if (pngDirectory != null) {
                return new PictureSize(pngDirectory.getInt(pngDirectory.TAG_IMAGE_WIDTH), pngDirectory.getInt(pngDirectory.TAG_IMAGE_HEIGHT));
            }

            final GifHeaderDirectory gifDirectory = metadata.getFirstDirectoryOfType(GifHeaderDirectory.class);
            if (gifDirectory != null) {
                return new PictureSize(gifDirectory.getInt(gifDirectory.TAG_IMAGE_WIDTH), gifDirectory.getInt(gifDirectory.TAG_IMAGE_HEIGHT));
            }

            final ExifIFD0Directory exifIFD0Directory = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
            if (exifIFD0Directory != null) {
                return new PictureSize(exifIFD0Directory.getInt(exifIFD0Directory.TAG_IMAGE_WIDTH), exifIFD0Directory.getInt(exifIFD0Directory.TAG_IMAGE_HEIGHT));
            }

            final ExifSubIFDDirectory exifSubIFDDirectory = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
            if (exifSubIFDDirectory != null) {
                return new PictureSize(exifSubIFDDirectory.getInt(ExifSubIFDDirectory.TAG_EXIF_IMAGE_WIDTH), exifSubIFDDirectory.getInt(ExifSubIFDDirectory.TAG_EXIF_IMAGE_HEIGHT));
            }
            return null;
        } catch (MetadataException e) {
            return null;
        }
    }

    public PictureSize(final int width, final int height) {
        this.width = width;
        this.height = height;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    @Override
    public String toString() {
        return width + "x" + height;
    }
}
