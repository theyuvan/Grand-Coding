package com.college.eventpass.service;

import com.college.eventpass.dto.UserRequest;
import com.college.eventpass.dto.UserResponse;
import com.college.eventpass.entity.Role;
import com.college.eventpass.entity.User;
import com.college.eventpass.exception.BusinessRuleException;
import com.college.eventpass.exception.ResourceNotFoundException;
import com.college.eventpass.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** ER entity USER: students and organizers. */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("A user already exists with email " + request.email());
        }
        User user = new User();
        user.setUserName(request.userName());
        user.setRole(request.role());
        user.setEmail(request.email());
        user.setPhoneNo(request.phoneNo());
        user.setCollege(request.college());
        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsers(Role role) {
        List<User> users = (role == null)
                ? userRepository.findAll()
                : userRepository.findByRoleOrderByUserNameAsc(role);
        return users.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(Long userId) {
        return toResponse(findUserOrThrow(userId));
    }

    @Transactional(readOnly = true)
    public User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getUserName(),
                user.getRole(),
                user.getEmail(),
                user.getPhoneNo(),
                user.getCollege()
        );
    }
}
