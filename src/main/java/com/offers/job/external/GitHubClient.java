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

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.*;

public class GitHubClient {
    private static final String URL_TEMPLATE = "https://jobs.github.com/positions.json?lat=%s&long=%s";
 //   private static final String DEFAULT_KEYWORD = "developer";

    private void extractKeyWords(List<Item> items) {
        MonkeyLearnClient monkeyLearnClient = new MonkeyLearnClient();
        List<String> descriptions = new ArrayList<>();
        for(Item item : items){
            // deal with a bug of monkey learn API -- cannot resolve "·"
            String description = item.getDescription().replace("·", " ");
            descriptions.add(description);
        }

        // if the description list cannot get a valid keyword list ,use title to extract again
        List<String> titles = new ArrayList<>();
        for(Item item : items) {
            titles.add(item.getTitle());
        }

        List<Set<String>> keywordList = monkeyLearnClient.extract(descriptions);
        if (keywordList.isEmpty()) {
            keywordList = monkeyLearnClient.extract(titles);
        }

        for(int i = 0; i < keywordList.size(); i++){
            items.get(i).setKeywords(keywordList.get(i));
        }
    }

    public List<Item> search(double lat, double lon, String keyword) {
        if (keyword != null) {
            try {
                keyword = URLEncoder.encode(keyword, "UTF-8");
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            }
        }
        String url = String.format(URL_TEMPLATE, lat, lon) + (keyword != null ? keyword : "");

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
                List<Item> items = Arrays.asList(mapper.readValue(entity.getContent(), Item[].class));
                extractKeyWords(items);
                return items;
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
