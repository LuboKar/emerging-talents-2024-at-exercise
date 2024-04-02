package com.filesystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FileInformation {
    private FileType type;
    private String capacity;
    private String usedSpace;
    private String freeSpace;
    private String path;
    private String parentPath;
}
