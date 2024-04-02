package com.filesystem.service;

import com.filesystem.dto.response.FileInformation;
import com.filesystem.dto.response.FileResponse;
import com.filesystem.dto.response.FileType;
import com.filesystem.dto.response.FilesResponse;
import com.filesystem.exception.AccessDeniedException;
import com.filesystem.exception.FileNotExistsException;
import com.filesystem.exception.OperationFailedException;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileSystemService {
  private static final String MY_PERSONAL_FILES = "MyPersonalFiles";

  public FilesResponse getAllAvailableDrives() {
    File[] roots = File.listRoots();

    List<FileResponse> driveResponseList = new ArrayList<>();

    try {
      for (File root : roots) {
        FileInformation fileInformation =
            FileInformation.builder()
                .capacity(formatSize(root.getTotalSpace()))
                .freeSpace(formatSize(root.getFreeSpace()))
                .usedSpace(formatSize(root.getTotalSpace() - root.getFreeSpace()))
                .type(FileType.LOCAL_DRIVE)
                .path(root.getPath())
                .parentPath(root.getParent())
                .build();
        FileResponse driveResponse =
            FileResponse.builder()
                .fileName(root.toString())
                .fileInformation(fileInformation)
                .build();

        driveResponseList.add(driveResponse);
      }
    } catch (SecurityException e) {
      throw new AccessDeniedException("You have no permissions here!");
    }

    return FilesResponse.builder().drives(driveResponseList).build();
  }

  public FilesResponse listAllFiles(String path) {

    File[] files = getFiles(path);

    List<FileResponse> driveResponseList = new ArrayList<>();

    String currentUserName = getCurrentUser();

    if (files != null && files.length > 0) {
      for (File file : files) {
        String parentPath = file.getParentFile().getParent();

        if (path.equals(MY_PERSONAL_FILES + "\\" + currentUserName)) {
          parentPath = MY_PERSONAL_FILES + "\\" + currentUserName;
        }

        long size = file.length();
        if (file.isDirectory()) {
          try {
            FileStore fileStore = Files.getFileStore(file.toPath());
            size = fileStore.getTotalSpace() - fileStore.getUnallocatedSpace();
          } catch (IOException e) {
            throw new RuntimeException(e);
          }
        }

        FileInformation fileInformation =
            FileInformation.builder()
                .usedSpace(formatSize(size))
                .type(file.isDirectory() ? FileType.DIRECTORY : FileType.FILE)
                .path(file.getPath())
                .parentPath(parentPath)
                .build();

        FileResponse driveResponse =
            FileResponse.builder()
                .fileName(file.toString().substring(file.toString().lastIndexOf("\\") + 1))
                .fileInformation(fileInformation)
                .build();
        driveResponseList.add(driveResponse);
      }
    } else {
      String parentPath =
          path.equals(MY_PERSONAL_FILES + "\\" + currentUserName)
              ? MY_PERSONAL_FILES + "\\" + currentUserName
              : path.substring(0, path.lastIndexOf("\\"));
      if (!parentPath.contains("\\")) {
        parentPath += "\\";
      }
      FileInformation fileInformation = FileInformation.builder().parentPath(parentPath).build();
      FileResponse driveResponse =
          FileResponse.builder().fileName(null).fileInformation(fileInformation).build();
      driveResponseList.add(driveResponse);
    }

    return FilesResponse.builder().drives(driveResponseList).build();
  }

  public FilesResponse listAllPersonalFiles() {
    return listAllFiles(MY_PERSONAL_FILES + "\\" + getCurrentUser());
  }

  public String moveFiles(String path, String destinationPath) {
    try {
      File fileToCopy = new File(path);
      if (!fileToCopy.exists()) {
        throw new FileNotExistsException();
      }

      Path destinationFilePath = Paths.get(destinationPath, fileToCopy.getName());

      Files.move(fileToCopy.toPath(), destinationFilePath, StandardCopyOption.ATOMIC_MOVE);

      return "{\"success\": \"File moved successfully\"}";
    } catch (SecurityException e) {
      throw new AccessDeniedException("You have no permissions here!");
    } catch (IOException e) {
      throw new OperationFailedException();
    }
  }

  public String uploadFile(MultipartFile file, String path) {
    if (file.isEmpty()) {
      throw new FileNotExistsException();
    }
    FileOutputStream fos = null;
    try {
      byte[] fileBytes = file.getBytes();
      String fileName = file.getOriginalFilename();
      File destination = new File(path, fileName);
      fos = new FileOutputStream(destination);
      fos.write(fileBytes);
      fos.close();

      return "{\"success\": \"File uploaded successfully\"}";
    } catch (SecurityException e) {
      throw new AccessDeniedException("You have no permissions here!");
    } catch (IOException e) {
      throw new OperationFailedException();
    } finally {
      try {
        if (fos != null) {
          fos.close();
        }
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
  }

  public String deleteFile(String path) {
    try {
      Path filePath = Paths.get(path);

      if (Files.isDirectory(filePath)) {
        deleteDirectory(filePath);
      } else {
        Files.delete(filePath);
      }

      return "{\"success\": \"Deleted successfully\"}";
    } catch (SecurityException e) {
      throw new AccessDeniedException("You have no permissions here!");
    } catch (IOException e) {
      throw new OperationFailedException();
    }
  }

  public ResponseEntity<byte[]> downloadFile(String filePath) {
    File file = new File(filePath);
    if (!file.exists() || !file.isFile()) {
      throw new FileNotExistsException();
    }
    try {
      byte[] data = Files.readAllBytes(file.toPath());
      HttpHeaders headers = new HttpHeaders();
      headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getName());
      headers.setContentType(getMediaType(file));

      return ResponseEntity.ok().headers(headers).body(data);
    } catch (IOException e) {
      throw new OperationFailedException();
    }
  }

  public String renameFile(String fullPath, String newName) {
    try {
      Path sourcePath = Paths.get(fullPath);

      Path targetPath = null;
      if (Files.isDirectory(sourcePath)) {
        targetPath = Paths.get(sourcePath.getParent().toString(), newName);
        if (Files.exists(targetPath)) {
          int counter = 1;
          while (Files.exists(targetPath)) {
            String incrementedName = newName + "(" + counter + ")";
            targetPath = Paths.get(sourcePath.getParent().toString(), incrementedName);
            counter++;
          }
        }
      } else {
        targetPath =
            Paths.get(
                sourcePath.getParent().toString(),
                newName + "." + fullPath.substring(fullPath.lastIndexOf(".") + 1));
        if (Files.exists(targetPath)) {
          int counter = 1;
          while (Files.exists(targetPath)) {
            String incrementedName = newName + "(" + counter + ")";
            targetPath =
                Paths.get(
                    sourcePath.getParent().toString(),
                    incrementedName + "." + fullPath.substring(fullPath.lastIndexOf(".") + 1));
            counter++;
          }
        }
      }

      Files.move(sourcePath, sourcePath.resolveSibling(targetPath.getFileName()));

      return "{\"success\": \"File renamed successfully\"}";
    } catch (SecurityException e) {
      throw new AccessDeniedException("You have no permissions here!");
    } catch (IOException e) {
      throw new OperationFailedException();
    }
  }

  public String createFolder(String path) {
    String folderName = "\\NewFolder";
    String folderPath = path + folderName;
    try {

      File folder = new File(folderPath);

      if (folder.exists()) {
        int count = 1;

        String newFolder;

        do {
          newFolder = path + folderName + "(" + count + ")";
          folder = new File(newFolder);
          count++;
        } while (folder.exists());
      }

      folder.mkdirs();
      return "{\"success\": \"Folder created successfully\"}";
    } catch (SecurityException e) {
      throw new AccessDeniedException("You have no permissions here!");
    }
  }

  private File[] getFiles(String path) {
    try {
      File directory = new File(path);
      return directory.listFiles(
          (dir, name) -> {
            File file = new File(dir, name);
            return !file.isHidden() && !Files.isSymbolicLink(file.toPath());
          });
    } catch (SecurityException e) {
      throw new AccessDeniedException("You have no permissions here!");
    }
  }

  private static String formatSize(Long bytes) {
    long kilobytes = bytes / 1024;
    long megabytes = kilobytes / 1024;
    long gigabytes = megabytes / 1024;

    if (gigabytes > 0) {
      return gigabytes + "GB";
    } else if (megabytes > 0) {
      return megabytes + "MB";
    } else if (kilobytes > 0) {
      return kilobytes + "KB";
    } else return bytes + "bytes";
  }

  private MediaType getMediaType(File file) {
    String fileName = file.getName();
    String fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
    return switch (fileExtension.toLowerCase()) {
      case "txt" -> MediaType.TEXT_PLAIN;
      case "pdf" -> MediaType.APPLICATION_PDF;
      case "jpeg" -> MediaType.IMAGE_JPEG;
      case "png" -> MediaType.IMAGE_PNG;
      case "gif" -> MediaType.IMAGE_GIF;
      default -> MediaType.APPLICATION_OCTET_STREAM;
    };
  }

  private void deleteDirectory(Path directory) throws IOException {
    try (DirectoryStream<Path> directoryStream = Files.newDirectoryStream(directory)) {
      for (Path path : directoryStream) {
        if (Files.isDirectory(path)) {
          deleteDirectory(path);
        } else {
          Files.delete(path);
        }
      }
    }
    Files.delete(directory);
  }

  private static long getDirectorySize(File directory) {
    long size = 0;

    File[] files = directory.listFiles();

    if (files != null) {
      for (File file : files) {
        if (file.isDirectory()) {
          size += getDirectorySize(file);
        } else {
          size += file.length();
        }
      }
    }
    return size;
  }

  private String getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication.getName();
  }
}
