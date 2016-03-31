package ch.exq.triplog.filter;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.UriBuilder;
import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static javax.ws.rs.core.HttpHeaders.USER_AGENT;

@WebFilter(filterName = "Html5RouterFilter", urlPatterns = {"/index.html", "/trips/*", "/visited-countries", "/login", "/add-trip"})
public class Html5RouterFilter implements Filter {

    private static final Pattern CRAWLER_AGENT_PATTERN = Pattern.compile("facebookexternalhit/[0-9]|Twitterbot|Pinterest|Google.*snippet|TelegramBot|WhatsApp");

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Do nothing
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        final HttpServletRequest request = (HttpServletRequest) servletRequest;
        final String userAgent = request.getHeader(USER_AGENT);
        final String servletPath = request.getServletPath();

        if (isCrawler(userAgent)) {
            // Redirect crawlers to special page with dynamic OGP (http://ogp.me) meta tags
            try {
                final URI requestUri = new URI(request.getRequestURL().toString());
                final URL ogpServiceUrl = new URL(UriBuilder.fromUri(requestUri).replacePath("services/ogp").queryParam("path", servletPath).build().toString());

                servletResponse.getWriter().write(Resources.toString(ogpServiceUrl, Charsets.UTF_8));
            } catch (Exception e) {
                e.printStackTrace();
                servletResponse.getWriter().write("Error while creating special OGP meta tags: " + e.getMessage());
            }
        } else if (!"/index.html".equals(servletPath)) {
            servletRequest.getRequestDispatcher("/index.html").forward(servletRequest, servletResponse);
        } else {
            filterChain.doFilter(servletRequest, servletResponse);
        }
    }

    @Override
    public void destroy() {
        // Do nothing
    }

    private boolean isCrawler(String userAgent) {
        Matcher crawlerMatcher = CRAWLER_AGENT_PATTERN.matcher(userAgent);
        return crawlerMatcher.find();
    }
}
