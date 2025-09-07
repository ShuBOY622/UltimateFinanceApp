package com.financeapp.service;

import com.financeapp.model.Udhaari;
import com.financeapp.model.User;
import com.financeapp.repository.UdhaariRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class UdhaariService {

    @Autowired
    private UdhaariRepository udhaariRepository;

    public Udhaari createUdhaari(Udhaari udhaari, User user) {
        udhaari.setUser(user);
        return udhaariRepository.save(udhaari);
    }

    public List<Udhaari> getUserUdhaari(User user) {
        return udhaariRepository.findByUserOrderByTransactionDateDesc(user);
    }

    public Udhaari updateUdhaari(Long udhaariId, Udhaari updatedUdhaari, User user) {
        Udhaari existingUdhaari = udhaariRepository.findById(udhaariId)
                .orElseThrow(() -> new RuntimeException("Udhaari entry not found"));

        if (!existingUdhaari.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this udhaari entry");
        }

        existingUdhaari.setPersonName(updatedUdhaari.getPersonName());
        existingUdhaari.setAmount(updatedUdhaari.getAmount());
        existingUdhaari.setDescription(updatedUdhaari.getDescription());
        existingUdhaari.setType(updatedUdhaari.getType());
        existingUdhaari.setTransactionDate(updatedUdhaari.getTransactionDate());

        return udhaariRepository.save(existingUdhaari);
    }

    public void deleteUdhaari(Long udhaariId, User user) {
        Udhaari udhaari = udhaariRepository.findById(udhaariId)
                .orElseThrow(() -> new RuntimeException("Udhaari entry not found"));

        if (!udhaari.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this udhaari entry");
        }

        udhaariRepository.delete(udhaari);
    }

    public Map<String, Object> getUdhaariSummary(User user) {
        Map<String, Object> summary = new HashMap<>();

        BigDecimal totalBorrowed = udhaariRepository.getTotalBorrowed(user);
        BigDecimal totalLent = udhaariRepository.getTotalLent(user);
        BigDecimal netUdhaari = udhaariRepository.getNetUdhaariAmount(user);

        summary.put("totalBorrowed", totalBorrowed);
        summary.put("totalLent", totalLent);
        summary.put("netUdhaari", netUdhaari);

        return summary;
    }
}