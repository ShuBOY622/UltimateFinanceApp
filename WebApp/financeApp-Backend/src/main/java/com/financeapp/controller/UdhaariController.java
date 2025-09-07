package com.financeapp.controller;

import com.financeapp.model.Udhaari;
import com.financeapp.model.User;
import com.financeapp.service.UdhaariService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/udhaari")
public class UdhaariController {

    @Autowired
    private UdhaariService udhaariService;

    @PostMapping
    public ResponseEntity<Udhaari> createUdhaari(@Valid @RequestBody Udhaari udhaari, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Udhaari createdUdhaari = udhaariService.createUdhaari(udhaari, user);
        return ResponseEntity.ok(createdUdhaari);
    }

    @GetMapping
    public ResponseEntity<List<Udhaari>> getUserUdhaari(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Udhaari> udhaariList = udhaariService.getUserUdhaari(user);
        return ResponseEntity.ok(udhaariList);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Udhaari> updateUdhaari(@PathVariable Long id, @Valid @RequestBody Udhaari udhaari, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Udhaari updatedUdhaari = udhaariService.updateUdhaari(id, udhaari, user);
        return ResponseEntity.ok(updatedUdhaari);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUdhaari(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        udhaariService.deleteUdhaari(id, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getUdhaariSummary(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Map<String, Object> summary = udhaariService.getUdhaariSummary(user);
        return ResponseEntity.ok(summary);
    }
}