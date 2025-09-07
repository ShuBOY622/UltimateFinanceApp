import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Surface, Avatar, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Landing' as never);
          },
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    // In a real app, you'd make an API call to update the profile
    Alert.alert('Success', 'Profile updated successfully');
    setEditing(false);
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title>Profile</Title>
        <Paragraph>Manage your account settings</Paragraph>
      </View>

      {/* Profile Card */}
      <View style={styles.profileSection}>
        <Surface style={styles.profileCard} elevation={3}>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={80}
              label={getInitials()}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </Surface>
      </View>

      {/* Profile Details */}
      <View style={styles.detailsSection}>
        <Surface style={styles.detailsCard} elevation={2}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <Button
              mode={editing ? "contained" : "outlined"}
              onPress={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </View>

          {editing ? (
            <View style={styles.editForm}>
              <TextInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
              />
              <TextInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
              />
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={handleSaveProfile}
                style={styles.saveButton}
              >
                Save Changes
              </Button>
            </View>
          ) : (
            <View style={styles.infoDisplay}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>First Name:</Text>
                <Text style={styles.infoValue}>{user?.firstName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Name:</Text>
                <Text style={styles.infoValue}>{user?.lastName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>
          )}
        </Surface>
      </View>

      {/* Account Actions */}
      <View style={styles.actionsSection}>
        <Surface style={styles.actionsCard} elevation={2}>
          <Text style={styles.cardTitle}>Account Actions</Text>

          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Info', 'Password change feature coming soon!')}
              style={styles.actionButton}
            >
              Change Password
            </Button>

            <Button
              mode="outlined"
              onPress={() => Alert.alert('Info', 'Data export feature coming soon!')}
              style={styles.actionButton}
            >
              Export Data
            </Button>

            <Button
              mode="outlined"
              onPress={() => Alert.alert('Info', 'Notification settings coming soon!')}
              style={styles.actionButton}
            >
              Notification Settings
            </Button>
          </View>
        </Surface>
      </View>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6366f1',
  },
  profileSection: {
    padding: 16,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'white',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#6366f1',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
  },
  detailsSection: {
    padding: 16,
    paddingTop: 0,
  },
  detailsCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  editForm: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  infoDisplay: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  actionsSection: {
    padding: 16,
    paddingTop: 0,
  },
  actionsCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
  },
  actionButtons: {
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  logoutSection: {
    padding: 16,
    paddingTop: 0,
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
});

export default ProfileScreen;