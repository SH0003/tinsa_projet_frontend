import React, { useState, useEffect, useCallback } from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { Table, Button, Modal, Form, message, Space, Tag, Card, Select, Row, Col, Descriptions, Divider, Popconfirm, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from '../utils/axios';
import dayjs from 'dayjs';
import TemoinForm from '../components/Temoins/TemoinForm';
import TemoinMap from '../components/Temoins/TemoinMap';
import './GestionTemoins.css';

const { Option } = Select;

const GestionTemoins = () => {
  // États de données
  const [temoins, setTemoins] = useState([]);
  const [filteredTemoins, setFilteredTemoins] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // États d'interface
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTemoin, setSelectedTemoin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const userRole = localStorage.getItem('userRole');

  // États pour les filtres
  const [filterValidation, setFilterValidation] = useState(null);
  const [filterRegion, setFilterRegion] = useState(null);
  const [filterProvince, setFilterProvince] = useState(null);
  const [filterCommune, setFilterCommune] = useState(null);
  const [filterTypeOperation, setFilterTypeOperation] = useState(null);
  const [filterTypologie, setFilterTypologie] = useState(null);
  const [filterDateStart, setFilterDateStart] = useState(null);
  const [filterDateEnd, setFilterDateEnd] = useState(null);

  // États pour les options
  const [options, setOptions] = useState({
    type_operation: [],
    orientation: [],
    niveau_standing: [],
    etat_conservation: [],
    source_temoin: []
  });
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);

  // États pour les chargements
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  // État pour la pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total) => `Total: ${total} témoins`
  });

  // Extraire typologies uniques pour le filtre
  const uniqueTypologies = React.useMemo(() => 
    [...new Set(temoins.map(t => t.typologie_bien).filter(Boolean))],
    [temoins]
  );

  // Fonction pour charger les options (ne change pas souvent)
  const fetchOptions = useCallback(async () => {
    if (options.type_operation.length > 0) return; // Ne pas recharger si déjà chargé
    
    try {
      setLoadingOptions(true);
      const response = await axios.get('/api/temoins/options/');
      setOptions(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des options:', error);
      message.error('Erreur lors du chargement des options');
    } finally {
      setLoadingOptions(false);
    }
  }, [options.type_operation.length]);

  // Fonction pour charger les régions (ne change pas souvent)
  const fetchRegions = useCallback(async () => {
    if (regions.length > 0) return; // Ne pas recharger si déjà chargé
    
    try {
      const response = await axios.get('/api/geographic-data/?action=regions');
      setRegions(response.data.regions);
    } catch (error) {
      console.error('Erreur lors du chargement des régions:', error);
      message.error('Erreur lors du chargement des régions');
    }
  }, [regions.length]);

  // Fonction pour charger les provinces pour une région
  const fetchProvinces = useCallback(async (region) => {
    setLoadingProvinces(true);
    try {
      const response = await axios.get(`/api/geographic-data/?action=provinces&region=${encodeURIComponent(region)}`);
      setProvinces(response.data.provinces);
    } catch (error) {
      console.error('Erreur lors du chargement des provinces:', error);
      message.error('Erreur lors du chargement des provinces');
    } finally {
      setLoadingProvinces(false);
    }
  }, []);

  // Fonction pour charger les communes pour une province
  const fetchCommunes = useCallback(async (region, province) => {
    setLoadingCommunes(true);
    try {
      const response = await axios.get(
        `/api/geographic-data/?action=communes&region=${encodeURIComponent(region)}&province=${encodeURIComponent(province)}`
      );
      setCommunes(response.data.communes);
    } catch (error) {
      console.error('Erreur lors du chargement des communes:', error);
      message.error('Erreur lors du chargement des communes');
    } finally {
      setLoadingCommunes(false);
    }
  }, []);

  // Fonction optimisée pour charger les témoins - avec pagination côté serveur
  const fetchTemoins = useCallback(async (page = 1, pageSize = 10) => {
    if (loading) return; // Éviter les appels multiples
    
    setLoading(true);
    try {
      console.log(`Chargement des témoins: page ${page}, taille ${pageSize}`);
      const response = await axios.get(`/api/superadmin/temoins/?page=${page}&page_size=${pageSize}`);
      
      // Vérifier si la réponse est paginée ou non
      if (response.data.results && response.data.total !== undefined) {
        // Réponse paginée
        setTemoins(response.data.results);
        setFilteredTemoins(response.data.results);
        setPagination({
          ...pagination,
          current: page,
          pageSize: pageSize,
          total: response.data.total
        });
      } else {
        // Format ancien - réponse non paginée
        setTemoins(response.data);
        setFilteredTemoins(response.data);
        setPagination({
          ...pagination,
          total: response.data.length
        });
      }
      
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Erreur lors du chargement des témoins:', error);
      message.error('Erreur lors du chargement des témoins');
    } finally {
      setLoading(false);
    }
  }, [loading, pagination]);

  // Gestionnaire de changement de page pour la table
  const handleTableChange = (pagination) => {
    fetchTemoins(pagination.current, pagination.pageSize);
  };
  const { current, pageSize } = pagination;
  // Effet initial pour charger les données au démarrage
  useEffect(() => {
    if (!isDataLoaded) {
      // Chargement parallèle des données statiques et des témoins
      Promise.all([
        fetchOptions(),
        fetchRegions(),
        fetchTemoins(current, pageSize)
      ]).catch(error => {
        console.error('Erreur lors du chargement initial:', error);
      });
    }
  }, [fetchOptions, fetchRegions, fetchTemoins, isDataLoaded, current, pageSize]);

  // Fonction pour appliquer les filtres localement (sans appel API)
  const applyFilters = useCallback(() => {
    if (temoins.length === 0) return;
    
    console.log('Application des filtres locaux');
    let filtered = [...temoins];

    // Filtre par État de validation
    if (filterValidation !== null) {
      filtered = filtered.filter(t => t.is_validated === filterValidation);
    }

    // Filtre par Région
    if (filterRegion) {
      filtered = filtered.filter(t => t.region === filterRegion);
    }

    // Filtre par Province
    if (filterProvince) {
      filtered = filtered.filter(t => t.province === filterProvince);
    }

    // Filtre par Commune
    if (filterCommune) {
      filtered = filtered.filter(t => t.commune === filterCommune);
    }

    // Filtre par Type d'opération
    if (filterTypeOperation) {
      filtered = filtered.filter(t => t.type_operation === filterTypeOperation);
    }

    // Filtre par Typologie
    if (filterTypologie) {
      filtered = filtered.filter(t => t.typologie_bien === filterTypologie);
    }

    // Filtre par date de début
    if (filterDateStart) {
      const startDate = filterDateStart.startOf('day').toDate();
      filtered = filtered.filter(t => t.date_transaction && new Date(t.date_transaction) >= startDate);
    }

    // Filtre par date de fin
    if (filterDateEnd) {
      const endDate = filterDateEnd.endOf('day').toDate();
      filtered = filtered.filter(t => t.date_transaction && new Date(t.date_transaction) <= endDate);
    }

    setFilteredTemoins(filtered);
  }, [temoins, filterValidation, filterRegion, filterProvince, filterCommune, filterTypeOperation, filterTypologie, filterDateStart, filterDateEnd]);

  // Appliquer les filtres quand les filtres changent
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handler pour le changement de région
  const handleRegionFilterChange = (value) => {
    setFilterRegion(value);
    setFilterProvince(null);
    setFilterCommune(null);
    setProvinces([]);
    setCommunes([]);
    
    if (value) {
      fetchProvinces(value);
    }
  };

  // Handler pour le changement de province
  const handleProvinceFilterChange = (value) => {
    setFilterProvince(value);
    setFilterCommune(null);
    setCommunes([]);
    
    if (value && filterRegion) {
      fetchCommunes(filterRegion, value);
    }
  };

  // Réinitialiser tous les filtres
  const handleResetFilters = () => {
    setFilterRegion(null);
    setFilterProvince(null);
    setFilterCommune(null);
    setFilterTypeOperation(null);
    setFilterTypologie(null);
    setFilterValidation(null);
    setFilterDateStart(null);
    setFilterDateEnd(null);
    setProvinces([]);
    setCommunes([]);
  };

  // Fonction pour rafraîchir manuellement les données
  const handleRefresh = () => {
    fetchTemoins(pagination.current, pagination.pageSize);
  };

  // Gestion de la création d'un nouveau témoin
  const handleCreate = () => {
    setEditMode(false);
    setSelectedTemoin(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Gestion de l'édition d'un témoin existant
  const handleEdit = (record) => {
    setEditMode(true);
    setSelectedTemoin(record);
    
    // Préparer les données pour le formulaire
    const formData = { ...record };
    if (record.date_transaction) {
      formData.date_transaction = dayjs(record.date_transaction);
    }
    
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  // Gestion de la suppression d'un témoin
  const handleDelete = async (record) => {
    try {
      await axios.delete(`/api/superadmin/temoins/${record.id}/`);
      message.success('Témoin supprimé avec succès');
      
      if (selectedTemoin?.id === record.id) {
        setSelectedTemoin(null);
        setExpandedRowKeys([]);
      }
      
      // Recharger les données après suppression
      fetchTemoins(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (values) => {
    try {
      if (editMode) {
        await axios.put(`/api/superadmin/temoins/${selectedTemoin.id}/`, values);
        message.success('Témoin mis à jour avec succès');
      } else {
        await axios.post('/api/superadmin/temoins/', values);
        message.success('Témoin créé avec succès');
      }
      setModalVisible(false);
      form.resetFields();
      
      // Recharger les données après création/modification
      fetchTemoins(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(editMode ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
      console.error(error);
    }
  };

  // Gestion du clic sur une ligne de la table
  const handleRowClick = (record) => {
    setSelectedTemoin(record);
    if (expandedRowKeys.includes(record.id)) {
      setExpandedRowKeys([]);
    } else {
      setExpandedRowKeys([record.id]);
    }
  };

  // Utilitaire pour obtenir l'URL complète d'une image
  const getFullImageUrl = (url) => {
    if (!url) return '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    if (url.startsWith('/media/')) {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      return `${apiUrl}${url}`;
    }
    
    return url;
  };

  // Utilitaire pour obtenir le label d'une option
  const getLabel = (fieldName, value) => {
    if (!value || !options[fieldName]) return value || 'N/A';
    const option = options[fieldName].find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // Gestion de la validation d'un témoin
  const handleValidate = async (temoinId) => {
    try {
      await axios.post(`/api/temoins/${temoinId}/valider/`);
      message.success('Témoin validé avec succès');
      fetchTemoins(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.response?.data?.error || 'Erreur lors de la validation');
    }
  };

  // Définition des colonnes du tableau
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Localisation',
      key: 'localisation',
      width: 200,
      render: (_, record) => (
        <div>
          <div><strong>{record.commune || 'N/A'}</strong></div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            {record.province || 'N/A'} - {record.region || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Type d\'opération',
      dataIndex: 'type_operation',
      key: 'type_operation',
      width: 150,
      render: (type) => {
        const colors = {
          'offre_vente': 'blue',
          'transaction_vente': 'green',
          'location': 'orange',
        };
        return <Tag color={colors[type]}>{getLabel('type_operation', type)}</Tag>;
      },
    },
    {
      title: 'Typologie',
      dataIndex: 'typologie_bien',
      key: 'typologie_bien',
      width: 150,
    },
    {
      title: 'Statut',
      key: 'status',
      dataIndex: 'is_validated',
      width: 100,
      render: (isValidated) => (
        isValidated ? (
          <Tag color="success" style={{ textAlign: 'center' }}>Validé</Tag>
        ) : (
          <Tag color="warning" style={{ textAlign: 'center' }}>En attente</Tag>
        )
      ),
    },
    {
      title: 'Date Transaction',
      dataIndex: 'date_transaction',
      key: 'date_transaction',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A',
    },
    {
      title: 'Surface (m²)',
      key: 'surfaces',
      width: 150,
      render: (_, record) => (
        <div>
          <div><strong>Parcelle:</strong> {record.parcelle ? parseFloat(record.parcelle).toLocaleString('fr-FR') : 'N/A'}</div>
          <div><strong>Vendable:</strong> {record.surface_vendable ? parseFloat(record.surface_vendable).toLocaleString('fr-FR') : 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Prix HT',
      dataIndex: 'valeur_offerte',
      key: 'valeur_offerte',
      width: 120,
      sorter: (a, b) => (parseFloat(a.valeur_offerte) || 0) - (parseFloat(b.valeur_offerte) || 0),
      render: (value) => value ? `${parseFloat(value).toLocaleString('fr-FR')} DH` : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 130,
      render: (_, record) => {
        const userRole = localStorage.getItem('userRole');
        
        return (
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(record);
              }}
              title="Voir les détails"
            />
            
            {userRole === 'superadmin' && (
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(record);
                }}
                disabled={record.is_validated}
                title="Modifier"
              />
            )}
            
            {userRole === 'superadmin' && (
              <Popconfirm
                title="Supprimer ce témoin"
                description="Êtes-vous sûr de vouloir supprimer ce témoin ?"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDelete(record);
                }}
                onCancel={(e) => e?.stopPropagation()}
                okText="Oui"
                cancelText="Non"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  disabled={record.is_validated}
                  title="Supprimer"
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  // Définition du rendu pour les lignes expansibles
  const expandedRowRender = (record) => {
    const userRole = localStorage.getItem('userRole');
  
    return (
      <div style={{ padding: '24px', background: '#fafafa' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <h3 style={{ margin: 0 }}>
              Détails du Témoin #{record.id}
              {record.is_validated && (
                <Tag color="success" style={{ marginLeft: 8 }}>
                  Validé
                </Tag>
              )}
            </h3>
          </Col>
          <Col>
            <Space>
              {!record.is_validated && (userRole === 'validateur' || userRole === 'superadmin') && (
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />}
                  onClick={() => handleValidate(record.id)}
                  style={{ background: '#52c41a' }}
                >
                  Valider
                </Button>
              )}
              
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                disabled={record.is_validated}
              >
                Modifier
              </Button>
              
              <Popconfirm
                title="Supprimer ce témoin"
                description="Êtes-vous sûr de vouloir supprimer ce témoin ?"
                onConfirm={() => handleDelete(record)}
                disabled={record.is_validated}
              >
                <Button danger icon={<DeleteOutlined />} disabled={record.is_validated}>
                  Supprimer
                </Button>
              </Popconfirm>
            </Space>
          </Col>
        </Row>

        {/* Contenu de la ligne expansible (inchangé) */}
        <Row gutter={[24, 24]}>
          {/* Colonne 1 : Localisation */}
          <Col xs={24} lg={8}>
            <Card 
              title="Localisation"
              style={{ height: '100%' }}
            >
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Région">
                  {record.region || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Province">
                  {record.province || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Commune">
                  {record.commune || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Adresse">
                  {record.adresse_generee || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Coordonnées GPS">
                  {record.latitude && record.longitude ? 
                    `${record.latitude}, ${record.longitude}` : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Colonne 2 : Caractéristiques */}
          <Col xs={24} lg={8}>
            <Card 
              title="Caractéristiques du Bien"
              style={{ marginBottom: '16px' }}
            >
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Type d'opération">
                  <Tag color={
                    record.type_operation === 'offre_vente' ? 'blue' :
                    record.type_operation === 'transaction_vente' ? 'green' : 'orange'
                  }>
                    {getLabel('type_operation', record.type_operation)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Date Transaction">
                  {record.date_transaction ? new Date(record.date_transaction).toLocaleDateString('fr-FR') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Typologie">
                  {record.typologie_bien || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Orientation">
                  {getLabel('orientation', record.orientation)}
                </Descriptions.Item>
                <Descriptions.Item label="Standing">
                  {getLabel('niveau_standing', record.niveau_standing)}
                </Descriptions.Item>
                <Descriptions.Item label="État de conservation">
                  {getLabel('etat_conservation', record.etat_conservation)}
                </Descriptions.Item>
                <Descriptions.Item label="Source">
                  {getLabel('source_temoin', record.source_temoin)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Colonne 3 : Surfaces et Prix */}
          <Col xs={24} lg={8}>
            <Card 
              title="Surfaces"
              style={{ marginBottom: '16px' }}
            >
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Surface Parcelle">
                  {record.parcelle ? `${parseFloat(record.parcelle).toLocaleString('fr-FR')} m²` : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Surface Vendable">
                  {record.surface_vendable ? `${parseFloat(record.surface_vendable).toLocaleString('fr-FR')} m²` : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Surface Jardin">
                  {record.surface_jardin_privatif ? `${parseFloat(record.surface_jardin_privatif).toLocaleString('fr-FR')} m²` : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Informations Financières">
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Valeur Offerte (HT)">
                  <strong style={{ fontSize: '16px', color: '#1890ff' }}>
                    {record.valeur_offerte ? 
                      `${parseFloat(record.valeur_offerte).toLocaleString('fr-FR')} DH` : 'N/A'}
                  </strong>
                </Descriptions.Item>
                <Descriptions.Item label="Valeur Unitaire">
                  {record.valeur_unitaire ? 
                    `${parseFloat(record.valeur_unitaire).toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} DH/m²` : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Section Images */}
        {record.images && record.images.length > 0 && (
          <>
            <Divider orientation="left">
              Images ({record.images.length})
            </Divider>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              flexWrap: 'wrap',
              padding: '16px',
              background: '#fff',
              borderRadius: '8px'
            }}>
              {record.images.map((imgUrl, index) => {
                const fullImageUrl = getFullImageUrl(imgUrl);
                
                return (
                  <div 
                    key={index}
                    style={{
                      border: '2px solid #e8e8e8',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={fullImageUrl}
                      alt={`Témoin n°${index + 1}`}
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onClick={() => window.open(fullImageUrl, '_blank')}
                      onError={(e) => {
                        console.error('Erreur chargement image:', fullImageUrl);
                        e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
                        e.target.style.border = '2px solid red';
                      }}
                    />
                    <div style={{
                      padding: '4px 8px',
                      background: '#f5f5f5',
                      fontSize: '11px',
                      color: '#666',
                      textAlign: 'center'
                    }}>
                      Image {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Observation */}
        {record.observation && (
          <>
            <Divider />
            <Card title="Observations">
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                {record.observation}
              </p>
            </Card>
          </>
        )}

        {/* Métadonnées */}
        {(record.created_at || record.updated_at) && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#fff', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
            <Row gutter={24}>
              {record.created_by_email && (
                <Col>
                  <small style={{ color: '#666' }}>
                    Créé par: {record.created_by_email}
                  </small>
                </Col>
              )}
              {record.created_at && (
                <Col>
                  <small style={{ color: '#666' }}>
                    Créé le: {new Date(record.created_at).toLocaleString('fr-FR')}
                  </small>
                </Col>
              )}
              {record.updated_at && (
                <Col>
                  <small style={{ color: '#666' }}>
                    Modifié le: {new Date(record.updated_at).toLocaleString('fr-FR')}
                  </small>
                </Col>
              )}
            </Row>
          </div>
        )}
      </div>
    );
  };

  // Rendu du composant
  return (
    <div className="gestion-temoins-container">
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Section filtres */}
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col flex="auto">
              <Row gutter={[12, 12]}>
                {/* Filtre État de validation */}
                <Col xs={24} sm={12} md={8} lg={3}>
                  <Select
                    placeholder="État de validation"
                    style={{ width: '100%' }}
                    allowClear
                    value={filterValidation}
                    onChange={setFilterValidation}
                  >
                    <Option value={true}>Validé</Option>
                    <Option value={false}>En attente</Option>
                  </Select>
                </Col>

                {/* Filtre Région */}
                <Col xs={24} sm={12} md={8} lg={3}>
                  <Select
                    placeholder="Région"
                    style={{ width: '100%' }}
                    allowClear
                    value={filterRegion}
                    onChange={handleRegionFilterChange}
                    showSearch
                    optionFilterProp="children"
                  >
                    {regions.map(region => (
                      <Option key={region} value={region}>
                        {region}
                      </Option>
                    ))}
                  </Select>
                </Col>

                {/* Filtre Province */}
                <Col xs={24} sm={12} md={8} lg={3}>
                  <Select
                    placeholder="Province"
                    style={{ width: '100%' }}
                    allowClear
                    value={filterProvince}
                    onChange={handleProvinceFilterChange}
                    disabled={!filterRegion}
                    loading={loadingProvinces}
                    showSearch
                    optionFilterProp="children"
                  >
                    {provinces.map(province => (
                      <Option key={province} value={province}>
                        {province}
                      </Option>
                    ))}
                  </Select>
                </Col>

                {/* Filtre Commune */}
                <Col xs={24} sm={12} md={8} lg={3}>
                  <Select
                    placeholder="Commune"
                    style={{ width: '100%' }}
                    allowClear
                    value={filterCommune}
                    onChange={setFilterCommune}
                    disabled={!filterProvince}
                    loading={loadingCommunes}
                    showSearch
                    optionFilterProp="children"
                  >
                    {communes.map(commune => (
                      <Option key={commune} value={commune}>
                        {commune}
                      </Option>
                    ))}
                  </Select>
                </Col>

                {/* Filtre Type d'opération */}
                <Col xs={24} sm={12} md={8} lg={3}>
                  <Select
                    placeholder="Type d'opération"
                    style={{ width: '100%' }}
                    allowClear
                    value={filterTypeOperation}
                    onChange={setFilterTypeOperation}
                    loading={loadingOptions}
                  >
                    {options.type_operation.map(opt => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>
                </Col>

                {/* Filtre Typologie */}
                <Col xs={24} sm={12} md={8} lg={3}>
                  <Select
                    placeholder="Typologie"
                    style={{ width: '100%' }}
                    allowClear
                    value={filterTypologie}
                    onChange={setFilterTypologie}
                  >
                    {uniqueTypologies.map(typo => (
                      <Option key={typo} value={typo}>
                        {typo}
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={4}>
                  <DatePicker
                    placeholder="Date début"
                    style={{ width: '100%' }}
                    allowClear
                    value={filterDateStart}
                    onChange={setFilterDateStart}
                    format="DD/MM/YYYY"
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <DatePicker
                    placeholder="Date fin"
                    style={{ width: '100%' }}
                    allowClear
                    value={filterDateEnd}
                    onChange={setFilterDateEnd}
                    format="DD/MM/YYYY"
                  />
                </Col>

                {/* Bouton Réinitialiser */}
                <Col xs={24} sm={12} md={8} lg={3}>
                  <Button onClick={handleResetFilters} style={{ width: '100%' }}>
                    Réinitialiser
                  </Button>
                </Col>
              </Row>
            </Col>
    
            <Col>
              {/* Boutons d'action */}
              <Space>
                <Button 
                  onClick={handleRefresh} 
                  icon={<ReloadOutlined />}
                  title="Rafraîchir les données"
                >
                  Rafraîchir
                </Button>

                {userRole === 'superadmin' && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                    size="medium"
                  >
                    Nouveau Témoin
                  </Button>
                )}
              </Space>
            </Col>
          </Row>

          {/* Tableau avec lignes expansibles */}
          <Table
            columns={columns}
            dataSource={filteredTemoins}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1500 }}
            pagination={pagination}
            onChange={handleTableChange}
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              onExpand: (expanded, record) => {
                setExpandedRowKeys(expanded ? [record.id] : []);
                if (expanded) {
                  setSelectedTemoin(record);
                }
              },
            }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { 
                cursor: 'pointer',
                background: selectedTemoin?.id === record.id ? '#e6f7ff' : 'white'
              },
            })}
          />
        </Space>
      </Card>

      {/* Carte globale */}
      <Card style={{ marginTop: '20px' }}>
        <TemoinMap 
          temoins={filteredTemoins} 
          selectedTemoin={selectedTemoin}
          onMarkerClick={handleRowClick}
        />
      </Card>

      {/* Modal création/édition */}
      <Modal
        title={editMode ? 'Modifier le Témoin' : 'Créer un Nouveau Témoin'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={1200}
        destroyOnClose
        maskClosable={false}
      >
        <TemoinForm
          form={form}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          editMode={editMode}
        />
      </Modal>
    </div>
  );
};

export default GestionTemoins;