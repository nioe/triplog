package ch.exq.triplog.filter;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebFilter(filterName = "Html5RouterFilter", urlPatterns = {"/welcome", "/trips/*", "/visited-countries"})
public class Html5RouterFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
            servletRequest.getRequestDispatcher("/index.html").forward(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
