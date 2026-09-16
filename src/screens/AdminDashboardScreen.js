import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import GiphyPickerDialog from '../components/GiphyPickerDialog';
import GenerateCodebaseDialog from '../components/GenerateCodebaseDialog';
import FirestoreService from '../services/FirestoreService';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AdminDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [appConfig, setAppConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Notification States
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifImage, setNotifImage] = useState('');
  const [notifTarget, setNotifTarget] = useState('all_users');
  const [isSending, setIsSending] = useState(false);

  // Dialog states
  const [showGiphy, setShowGiphy] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);

  useEffect(() => {
    const unsubscribe = FirestoreService.getAppConfig((config) => {
      setAppConfig(config);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateConfig = async (key, value) => {
    await FirestoreService.updateAppConfig({ [key]: value });
  };

  const sendNotification = async () => {
    if (!notifTitle || !notifBody) return;
    setIsSending(true);
    try {
      await FirestoreService.updateAppConfig({
        last_broadcast: {
          title: notifTitle,
          body: notifBody,
          imageUrl: notifImage,
          target: notifTarget,
          timestamp: new Date().toISOString(),
          status: 'pending'
        }
      });
      alert('Notification campaign queued!');
      setNotifTitle('');
      setNotifBody('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsRow}>
        <StatCard title="TOTAL USERS" value="1.2k" icon="account-group" color="#3B82F6" />
        <StatCard title="PRO MEMBERS" value="142" icon="star" color="#F59E0B" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Health</Text>
        <HealthItem label="Firebase Services" active={true} />
        <HealthItem label="AI Engine (Gemini)" active={appConfig.aiEnabled !== false} />
        <HealthItem label="Storage Systems" active={true} />
      </View>
    </ScrollView>
  );

  const renderBroadcast = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>New Campaign</Text>
      <TextInput
        style={styles.input}
        placeholder="Notification Title"
        value={notifTitle}
        onChangeText={setNotifTitle}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Message Body"
        multiline
        value={notifBody}
        onChangeText={setNotifBody}
      />
      <TextInput
        style={styles.input}
        placeholder="Image URL (Optional)"
        value={notifImage}
        onChangeText={setNotifImage}
      />
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={sendNotification} disabled={isSending}>
          {isSending ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>SEND BROADCAST</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginLeft: 8, backgroundColor: '#10B981' }]} onPress={() => setShowGiphy(true)}>
          <Text style={styles.buttonText}>Pick GIF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSystem = () => (
    <ScrollView style={styles.tabContent}>
      <ConfigToggle
        label="Maintenance Mode"
        description="Block all user access for updates"
        value={appConfig.maintenanceMode}
        onValueChange={(v) => updateConfig('maintenanceMode', v)}
      />
      <ConfigToggle
        label="AI Features"
        description="Enable/Disable Gemini AI globally"
        value={appConfig.aiEnabled !== false}
        onValueChange={(v) => updateConfig('aiEnabled', v)}
      />

      <Text style={styles.sectionTitle}>Branding & Events</Text>
      <TextInput
        style={styles.input}
        placeholder="Remote Header Text"
        defaultValue={appConfig.remoteHeaderText}
        onEndEditing={(e) => updateConfig('remoteHeaderText', e.nativeEvent.text)}
      />
      <ConfigToggle
        label="Event Dialog"
        description="Show custom popup on startup"
        value={appConfig.showEventDialog}
        onValueChange={(v) => updateConfig('showEventDialog', v)}
      />
      <TouchableOpacity style={[styles.primaryButton, { marginTop: 16, backgroundColor: '#6366F1' }]} onPress={() => setShowGenerate(true)}>
        <Text style={styles.buttonText}>Generate Codebase</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (isLoading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      {/* Sidebar Simulation for Mobile/Tablet */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SaaS Console</Text>
      </View>

      <View style={styles.tabsRow}>
        <TabItem label="Overview" active={activeTab === 'Overview'} onPress={() => setActiveTab('Overview')} />
        <TabItem label="Broadcast" active={activeTab === 'Broadcast'} onPress={() => setActiveTab('Broadcast')} />
        <TabItem label="System" active={activeTab === 'System'} onPress={() => setActiveTab('System')} />
      </View>

      {activeTab === 'Overview' && renderOverview()}
      {activeTab === 'Broadcast' && renderBroadcast()}
      {activeTab === 'System' && renderSystem()}

      {/* Dialogs */}
      <GiphyPickerDialog
        visible={showGiphy}
        onClose={() => setShowGiphy(false)}
        onSelect={url => setNotifImage(url)}
      />
      <GenerateCodebaseDialog
        visible={showGenerate}
        onClose={() => setShowGenerate(false)}
        onGenerate={repo => {}}
      />
    </View>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Icon name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const HealthItem = ({ label, active }) => (
  <View style={styles.healthItem}>
    <Icon name={active ? "check-circle" : "alert-circle"} color={active ? "#10B981" : "#EF4444"} size={20} />
    <Text style={styles.healthLabel}>{label}</Text>
  </View>
);

const ConfigToggle = ({ label, description, value, onValueChange }) => (
  <View style={styles.toggleRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={styles.toggleDesc}>{description}</Text>
    </View>
    <Switch value={value} onValueChange={onValueChange} thumbColor={Colors.primary} />
  </View>
);

const TabItem = ({ label, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabItem, active && styles.activeTab]}>
    <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FD' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  tabsRow: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 12 },
  tabItem: { padding: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: Colors.primary },
  tabText: { fontWeight: '600', color: 'grey' },
  activeTabText: { color: Colors.primary },
  tabContent: { flex: 1, padding: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { flex: 1, backgroundColor: 'white', padding: 20, borderRadius: 16, margin: 5, borderLeftWidth: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginVertical: 4 },
  statTitle: { fontSize: 10, color: 'grey', fontWeight: 'bold' },
  section: { marginTop: 24, backgroundColor: 'white', padding: 20, borderRadius: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  healthItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  healthLabel: { marginLeft: 12, fontSize: 14, color: '#444' },
  input: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#DDD' },
  primaryButton: { backgroundColor: Colors.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  actionRow: { flexDirection: 'row', marginBottom: 12 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12 },
  toggleLabel: { fontSize: 15, fontWeight: 'bold' },
  toggleDesc: { fontSize: 12, color: 'grey' },
});

export default AdminDashboardScreen;
