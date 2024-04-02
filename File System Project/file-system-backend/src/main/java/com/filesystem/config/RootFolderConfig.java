package com.filesystem.config;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class RootFolderConfig {
    @PostConstruct
    public void init() {
        String folderPath = "MyPersonalFiles";

        File folder = new File(folderPath);

        if (!folder.exists()) {
            folder.mkdirs();
        }
    }
}
