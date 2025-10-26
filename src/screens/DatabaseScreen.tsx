import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {
  getDatabaseStats,
  clearAllData,
  exportDatabase,
  importDatabase,
} from '../database/DatabaseManager';

interface DatabaseStats {
  totalPhotos: number;
  renderedPhotos: number;
  totalSessions: number;
  databaseSize: string;
}

const DatabaseScreen = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const databaseStats = await getDatabaseStats();
      setStats(databaseStats);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar estatísticas do banco de dados');
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Confirmar limpeza',
      'Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              await loadStats();
              Alert.alert('Sucesso', 'Todos os dados foram limpos');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao limpar dados');
              console.error('Erro ao limpar dados:', error);
            }
          },
        },
      ]
    );
  }, [loadStats]);

  const handleExportData = useCallback(async () => {
    try {
      const exportPath = await exportDatabase();
      Alert.alert(
        'Exportação concluída',
        `Dados exportados para: ${exportPath}`,
        [{text: 'OK'}]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao exportar dados');
      console.error('Erro ao exportar dados:', error);
    }
  }, []);

  const handleImportData = useCallback(async () => {
    Alert.alert(
      'Importar dados',
      'Esta funcionalidade permite importar dados de um arquivo de backup.',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Importar',
          onPress: async () => {
            try {
              await importDatabase();
              await loadStats();
              Alert.alert('Sucesso', 'Dados importados com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao importar dados');
              console.error('Erro ao importar dados:', error);
            }
          },
        },
      ]
    );
  }, [loadStats]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
  }> = ({title, value, icon, color}: {title: string; value: string | number; icon: string; color: string}) => (
    <View style={[styles.statCard, {borderLeftColor: color}]}>
      <View style={[styles.statIcon, {backgroundColor: color}]}>
        <Ionicons name={icon as any} size={24} color="#ffffff" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const ActionButton: React.FC<{
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    onPress: () => void;
    danger?: boolean;
  }> = ({title, subtitle, icon, color, onPress, danger = false}: {
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        {borderLeftColor: color},
        danger && styles.dangerButton,
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.actionIcon, {backgroundColor: color}]}>
        <Ionicons name={icon as any} size={24} color="#ffffff" />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Banco de Dados</Text>
          <Text style={styles.subtitle}>
            Gerenciamento e estatísticas do SQLite3
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass" size={48} color="#6366f1" />
            <Text style={styles.loadingText}>Carregando estatísticas...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Estatísticas</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  title="Total de Fotos"
                  value={stats?.totalPhotos || 0}
                  icon="image"
                  color="#6366f1"
                />
                <StatCard
                  title="Fotos Renderizadas"
                  value={stats?.renderedPhotos || 0}
                  icon="cube"
                  color="#10b981"
                />
                <StatCard
                  title="Usuários"
                  value={0}
                  icon="people"
                  color="#8b5cf6"
                />
                <StatCard
                  title="Sessões"
                  value={stats?.totalSessions || 0}
                  icon="time"
                  color="#f59e0b"
                />
              </View>
              <View style={styles.databaseInfo}>
                <Ionicons name="server" size={20} color="#6b7280" />
                <Text style={styles.databaseInfoText}>
                  Tamanho do banco: {stats?.databaseSize || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <Text style={styles.sectionTitle}>Ações</Text>
              
              <ActionButton
                title="Exportar Dados"
                subtitle="Criar backup do banco de dados"
                icon="cloud-upload"
                color="#10b981"
                onPress={handleExportData}
              />
              
              <ActionButton
                title="Importar Dados"
                subtitle="Restaurar dados de um backup"
                icon="cloud-download"
                color="#6366f1"
                onPress={handleImportData}
              />
              
              <ActionButton
                title="Limpar Dados"
                subtitle="Remover todos os dados (irreversível)"
                icon="trash"
                color="#ef4444"
                onPress={handleClearData}
                danger
              />
            </View>

            <View style={styles.schemaContainer}>
              <Text style={styles.sectionTitle}>Esquema do Banco (5NF)</Text>
              <View style={styles.schemaInfo}>
                <Text style={styles.schemaText}>
                  • Tabela Users (id, name, email, created_at){'\n'}
                  • Tabela Photos (id, uri, name, timestamp){'\n'}
                  • Tabela PhotoMetadata (photo_id, width, height, size){'\n'}
                  • Tabela ARSessions (id, user_id, created_at){'\n'}
                  • Tabela ARRenders (id, session_id, photo_id, rendered_at){'\n'}
                  • Tabela PhotoTags (id, photo_id, tag_name){'\n'}
                  • Normalizado até a 5ª Forma Normal
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
  },
  statsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.62,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  databaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    gap: 8,
  },
  databaseInfoText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.62,
  },
  dangerButton: {
    backgroundColor: '#fef2f2',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  dangerText: {
    color: '#ef4444',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  schemaContainer: {
    marginBottom: 20,
  },
  schemaInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.62,
  },
  schemaText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});

export default DatabaseScreen;
