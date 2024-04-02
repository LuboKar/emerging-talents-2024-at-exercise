package com.filesystem.controller;

import com.filesystem.dto.response.FilesResponse;
import com.filesystem.service.FileSystemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/filesystem")
public class FileSystemController {

  private final FileSystemService fileSystemService;

  @GetMapping("/drives")
  public ResponseEntity<FilesResponse> getAllAvailableDrives() {
    return ResponseEntity.ok(fileSystemService.getAllAvailableDrives());
  }

  @GetMapping("/files")
  public ResponseEntity<FilesResponse> listAllFiles(@RequestParam("path") String path) {
    return ResponseEntity.ok(fileSystemService.listAllFiles(path));
  }

  @GetMapping("/files/personal")
  public ResponseEntity<FilesResponse> listAllPersonalFiles() {
    return ResponseEntity.ok(fileSystemService.listAllPersonalFiles());
  }

  @PostMapping("/files/move")
  public ResponseEntity<String> moveFiles(
      @RequestParam("path") String path, @RequestParam("destinationPath") String destinationPath) {
    return ResponseEntity.ok(fileSystemService.moveFiles(path, destinationPath));
  }

  @PostMapping("/files/upload")
  public ResponseEntity<String> uploadFiles(
      @RequestParam("file") MultipartFile file,
      @RequestParam("destinationPath") String destinationPath) {
    return ResponseEntity.ok(fileSystemService.uploadFile(file, destinationPath));
  }

  @DeleteMapping("/files/delete")
  public ResponseEntity<String> deleteFile(@RequestParam("path") String path) {
    return ResponseEntity.ok(fileSystemService.deleteFile(path));
  }

  @GetMapping("/files/download")
  public ResponseEntity<byte[]> downloadFile(@RequestParam("filePath") String filePath) {
    return fileSystemService.downloadFile(filePath);
  }

  @PostMapping("/files/rename")
  public ResponseEntity<String> renameFile(
      @RequestParam("path") String path, @RequestParam("newName") String newName) {
    return ResponseEntity.ok(fileSystemService.renameFile(path, newName));
  }

  @PostMapping("/files/create")
  public ResponseEntity<String> createFolder(@RequestParam("path") String path) {
    return ResponseEntity.ok(fileSystemService.createFolder(path));
  }
}
