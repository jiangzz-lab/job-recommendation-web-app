package com.offers.job.external;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.offers.job.entity.Item;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class GitHubClient {
    private static final String URL_TEMPLATE = "https://jobs.github.com/positions.json?description=%s&lat=%s&long=%s";
    private static final String DEFAULT_KEYWORD = "developer";

    public List<Item> search(double lat, double lon, String keyword) {
        if (keyword == null) {
            keyword = DEFAULT_KEYWORD;
        }

        try {
            keyword = URLEncoder.encode(keyword, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        String url = String.format(URL_TEMPLATE, keyword, lat, lon);

        CloseableHttpClient httpclient = HttpClients.createDefault();

        // create a custom response handler
        // why we use a response handler here ?
        // official explanation "This example demonstrates how to process HTTP responses using a response handler.
        // This is the recommended way of executing HTTP requests and processing HTTP responses.
        // This approach enables the caller to concentrate on the process of digesting HTTP responses and to delegate
        // the task of system resource deallocation to HttpClient. The use of an HTTP response handler guarantees that
        // the underlying HTTP connection will be released back to the connection manager automatically in all cases."
        ResponseHandler<List<Item>> responseHandler = new ResponseHandler<List<Item>>() {
            @Override
            public List<Item> handleResponse(HttpResponse response) throws ClientProtocolException, IOException {
                int status = response.getStatusLine().getStatusCode();
                if (status != 200) {
                    return Collections.emptyList();
                }
                HttpEntity entity = response.getEntity();
                if (entity == null) {
                    return Collections.emptyList();
                }
                ObjectMapper mapper = new ObjectMapper();
                return Arrays.asList(mapper.readValue(entity.getContent(), Item[].class));
            }
        };

        try {
            return httpclient.execute(new HttpGet(url), responseHandler);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return Collections.emptyList();
    }
}
