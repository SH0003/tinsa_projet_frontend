import React, { useState, useEffect, useCallback } from 'react';
import { Card, Space, Button, Modal, Form, Row, Col } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// Custom hooks
import { useTemoins } from '../hooks/useTemoins';
import { useOptions } from '../hooks/useOptions';
import { useGeographicData } from '../hooks/useGeographicData';
import { useFilters } from '../hooks/useFilters';

// Components
import TemoinFilters from '../components/Temoins/TemoinFilters';
import TemoinTable from '../components/Temoins/TemoinTable';
import TemoinForm from '../components/Temoins/TemoinForm';
import TemoinMap from '../components/Temoins/TemoinMap';

// Styles
import './GestionTemoins.css';

const GestionTemoins = () => {
  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole');

  // Custom hooks for data management
  const {
    temoins,
    loading: loadingTemoins,
    pagination,
    fetchTemoins,
    createTemoin,
    updateTemoin,
    deleteTemoin,
    validateTemoin
  } = useTemoins();

  const { options, loading: loadingOptions, getLabel } = useOptions();

  const {
    regions,
    provinces,
    communes,
    loadingProvinces,
    loadingCommunes,
    fetchProvinces,
    fetchCommunes,
    resetProvinces,
    resetCommunes
  } = useGeographicData();

  const {
    filters,
    filteredTemoins,
    uniqueTypologies,
    handleFilterChange,
    resetFilters
  } = useFilters(temoins);

  // Local UI state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTemoin, setSelectedTemoin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [form] = Form.useForm();

  // Fetch temoins on mount
  useEffect(() => {
    fetchTemoins(1, 10);
  }, [fetchTemoins]); // Include fetchTemoins (it's stable from the hook)

  // Handle geographic filter changes
  const handleRegionFilterChange = useCallback((region) => {
    resetProvinces();
    if (region) {
      fetchProvinces(region);
    }
  }, [fetchProvinces, resetProvinces]);

  const handleProvinceFilterChange = useCallback((region, province) => {
    resetCommunes();
    if (region && province) {
      fetchCommunes(region, province);
    }
  }, [fetchCommunes, resetCommunes]);

  // Handle filter reset
  const handleResetFilters = useCallback(() => {
    resetFilters();
    resetProvinces();
    resetCommunes();
  }, [resetFilters, resetProvinces, resetCommunes]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchTemoins(pagination.current, pagination.pageSize);
  }, [fetchTemoins, pagination]);

  // Handle table pagination change
  const handleTableChange = useCallback((newPagination) => {
    fetchTemoins(newPagination.current, newPagination.pageSize);
  }, [fetchTemoins]);

  // Handle create new temoin
  const handleCreate = useCallback(() => {
    setEditMode(false);
    setSelectedTemoin(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  // Handle edit temoin
  const handleEdit = useCallback((record) => {
    setEditMode(true);
    setSelectedTemoin(record);
    
    // Prepare form data
    const formData = { ...record };
    if (record.date_transaction) {
      formData.date_transaction = dayjs(record.date_transaction);
    }
    
    form.setFieldsValue(formData);
    setModalVisible(true);
  }, [form]);

  // Handle delete temoin
  const handleDelete = useCallback(async (record) => {
    const success = await deleteTemoin(record.id);
    
    if (success) {
      // Clear selection if deleted temoin was selected
      if (selectedTemoin?.id === record.id) {
        setSelectedTemoin(null);
        setExpandedRowKeys([]);
      }
      
      // Refresh data
      fetchTemoins(pagination.current, pagination.pageSize);
    }
  }, [deleteTemoin, selectedTemoin, fetchTemoins, pagination]);

  // Handle validate temoin
  const handleValidate = useCallback(async (id) => {
    const success = await validateTemoin(id);
    
    if (success) {
      fetchTemoins(pagination.current, pagination.pageSize);
    }
  }, [validateTemoin, fetchTemoins, pagination]);

  // Handle form submit
  const handleSubmit = useCallback(async (values) => {
    let success = false;
    
    if (editMode) {
      success = await updateTemoin(selectedTemoin.id, values);
    } else {
      success = await createTemoin(values);
    }

    if (success) {
      setModalVisible(false);
      form.resetFields();
      fetchTemoins(pagination.current, pagination.pageSize);
    }
  }, [editMode, selectedTemoin, updateTemoin, createTemoin, form, fetchTemoins, pagination]);

  // Handle row click
  const handleRowClick = useCallback((record) => {
    setSelectedTemoin(record);
    if (expandedRowKeys.includes(record.id)) {
      setExpandedRowKeys([]);
    } else {
      setExpandedRowKeys([record.id]);
    }
  }, [expandedRowKeys]);

  // Handle row expand
  const handleExpand = useCallback((expanded, record) => {
    setExpandedRowKeys(expanded ? [record.id] : []);
    if (expanded) {
      setSelectedTemoin(record);
    }
  }, []);

  // Utility function to get full image URL
  const getFullImageUrl = useCallback((url) => {
    if (!url) return '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    if (url.startsWith('/media/')) {
      const apiUrl = process.env.REACT_APP_ENV === 'production' ? 'http://88.223.95.155:8060' : 'http://localhost:8000';
      return `${apiUrl}${url}`;
    }
    
    return url;
  }, []);

  return (
    <div className="gestion-temoins-container">
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Filters and Actions Row */}
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col flex="auto">
              <TemoinFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                regions={regions}
                provinces={provinces}
                communes={communes}
                typologies={uniqueTypologies}
                typeOperations={options.type_operation}
                loadingProvinces={loadingProvinces}
                loadingCommunes={loadingCommunes}
                loadingOptions={loadingOptions}
                onRegionChange={handleRegionFilterChange}
                onProvinceChange={handleProvinceFilterChange}
              />
            </Col>
            
            <Col>
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

          {/* Table */}
          <TemoinTable
            dataSource={filteredTemoins}
            loading={loadingTemoins}
            pagination={pagination}
            expandedRowKeys={expandedRowKeys}
            selectedTemoin={selectedTemoin}
            userRole={userRole}
            getLabel={getLabel}
            getFullImageUrl={getFullImageUrl}
            onRowClick={handleRowClick}
            onExpand={handleExpand}
            onTableChange={handleTableChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onValidate={handleValidate}
          />
        </Space>
      </Card>

      {/* Map */}
      <Card style={{ marginTop: '20px' }}>
        <TemoinMap 
          temoins={filteredTemoins} 
          selectedTemoin={selectedTemoin}
          onMarkerClick={handleRowClick}
        />
      </Card>

      {/* Create/Edit Modal */}
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
