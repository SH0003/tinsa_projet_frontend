import React, { useState, useEffect } from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { Table, Button, Modal, Form, message, Space, Tag, Card, Select, Row, Col, Descriptions, Divider, Popconfirm, Input } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import axios from '../utils/axios';
import TemoinForm from '../components/Temoins/TemoinForm';
import TemoinMap from '../components/Temoins/TemoinMap';
import './GestionTemoins.css';

const { Option } = Select;

const GestionTemoins = () => {
  const [temoins, setTemoins] = useState([]);
  const [filteredTemoins, setFilteredTemoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTemoin, setSelectedTemoin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const userRole = localStorage.getItem('userRole');

  const [filterValidation, setFilterValidation] = useState(null);

  const [options, setOptions] = useState({
    type_operation: [],
    orientation: [],
    niveau_standing: [],
    etat_conservation: [],
    source_temoin: []
  });
  const [loadingOptions, setLoadingOptions] = useState(true);

  // ✅ NOUVEAUX États pour les données géographiques
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  // ✅ MODIFIÉ : États pour les 5 filtres
  const [filterRegion, setFilterRegion] = useState(null);
  const [filterProvince, setFilterProvince] = useState(null);
  const [filterCommune, setFilterCommune] = useState(null);
  const [filterTypeOperation, setFilterTypeOperation] = useState(null);
  const [filterTypologie, setFilterTypologie] = useState(null);

  useEffect(() => {
    fetchOptions();
    fetchTemoins();
    fetchRegions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [temoins, filterRegion, filterProvince, filterCommune, filterTypeOperation, filterTypologie, filterValidation]);

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

  const fetchOptions = async () => {
    try {
      const response = await axios.get('/api/temoins/options/');
      setOptions(response.data);
      setLoadingOptions(false);
    } catch (error) {
      console.error('Erreur lors du chargement des options:', error);
      message.error('Erreur lors du chargement des options');
      setLoadingOptions(false);
    }
  };

  // ✅ NOUVEAU : Récupérer les régions
  const fetchRegions = async () => {
    try {
      const response = await axios.get('/api/geographic-data/?action=regions');
      setRegions(response.data.regions);
    } catch (error) {
      console.error('Erreur lors du chargement des régions:', error);
      message.error('Erreur lors du chargement des régions');
    }
  };

  // ✅ NOUVEAU : Récupérer les provinces pour une région
  const fetchProvinces = async (region) => {
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
  };

  // ✅ NOUVEAU : Récupérer les communes pour une province
  const fetchCommunes = async (region, province) => {
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
  };

  const fetchTemoins = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/superadmin/temoins/');
      setTemoins(response.data);
      setFilteredTemoins(response.data);
    } catch (error) {
      message.error('Erreur lors du chargement des témoins');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MODIFIÉ : Application des 5 filtres
  const applyFilters = () => {
    let filtered = [...temoins];

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

    // Filtre par État de validation
    if (filterValidation !== null) {
      filtered = filtered.filter(t => t.is_validated === filterValidation);
    }

    setFilteredTemoins(filtered);
  };

  // ✅ NOUVEAU : Handler pour le changement de région
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

  // ✅ NOUVEAU : Handler pour le changement de province
  const handleProvinceFilterChange = (value) => {
    setFilterProvince(value);
    setFilterCommune(null);
    setCommunes([]);
    
    if (value && filterRegion) {
      fetchCommunes(filterRegion, value);
    }
  };

  // ✅ MODIFIÉ : Réinitialiser tous les filtres
  const handleResetFilters = () => {
    setFilterRegion(null);
    setFilterProvince(null);
    setFilterCommune(null);
    setFilterTypeOperation(null);
    setFilterTypologie(null);
    setFilterValidation(null);
    setProvinces([]);
    setCommunes([]);
  };

  const handleCreate = () => {
    setEditMode(false);
    setSelectedTemoin(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditMode(true);
    setSelectedTemoin(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await axios.delete(`/api/superadmin/temoins/${record.id}/`);
      message.success('Témoin supprimé avec succès');
      
      if (selectedTemoin?.id === record.id) {
        setSelectedTemoin(null);
        setExpandedRowKeys([]);
      }
      
      fetchTemoins();
    } catch (error) {
      message.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

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
      fetchTemoins();
    } catch (error) {
      message.error(editMode ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
      console.error(error);
    }
  };

  const handleRowClick = (record) => {
    setSelectedTemoin(record);
    if (expandedRowKeys.includes(record.id)) {
      setExpandedRowKeys([]);
    } else {
      setExpandedRowKeys([record.id]);
    }
  };

  const getLabel = (fieldName, value) => {
    if (!value || !options[fieldName]) return value || 'N/A';
    const option = options[fieldName].find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // ✅ NOUVEAU : Extraire les typologies uniques pour le filtre
  const uniqueTypologies = [...new Set(temoins.map(t => t.typologie_bien).filter(Boolean))];

  const handleValidate = async (temoinId) => {
    try {
      await axios.post(`/api/temoins/${temoinId}/valider/`);
      message.success('Témoin validé avec succès');
      fetchTemoins();
    } catch (error) {
      message.error(error.response?.data?.error || 'Erreur lors de la validation');
    }
  };

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
                onConfirm={() => handleDelete(record.id)}
                disabled={record.is_validated}
              >
                <Button danger icon={<DeleteOutlined />} disabled={record.is_validated}>
                  Supprimer
                </Button>
              </Popconfirm>
            </Space>
          </Col>
        </Row>

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
                      alt={`Image ${index + 1}`}
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
      title: 'Standing',
      dataIndex: 'niveau_standing',
      key: 'niveau_standing',
      width: 120,
      render: (standing) => getLabel('niveau_standing', standing),
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
  ];

  return (
    <div className="gestion-temoins-container">
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* ✅ MODIFIÉ : Nouvelle section de filtres avec 5 filtres */}
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col flex="auto">
              <Row gutter={[12, 12]}>
                {/* Filtre État de validation */}
                <Col xs={24} sm={12} md={8} lg={4}>
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
                <Col xs={24} sm={12} md={8} lg={4}>
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
                <Col xs={24} sm={12} md={8} lg={4}>
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
                <Col xs={24} sm={12} md={8} lg={4}>
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
                <Col xs={24} sm={12} md={8} lg={4}>
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
                <Col xs={24} sm={12} md={8} lg={4}>
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

                {/* Bouton Réinitialiser */}
                <Col xs={24} sm={12} md={8} lg={3}>
                  <Button onClick={handleResetFilters} style={{ width: '100%' }}>
                    Réinitialiser
                  </Button>
                </Col>
              </Row>
            </Col>
    
            <Col>
              {userRole === 'superadmin' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  size="large"
                >
                  Nouveau Témoin
                </Button>
              )}
            </Col>
          </Row>

          {/* Tableau avec lignes expansibles */}
          <Table
            columns={columns}
            dataSource={filteredTemoins}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1500 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} témoins`,
            }}
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