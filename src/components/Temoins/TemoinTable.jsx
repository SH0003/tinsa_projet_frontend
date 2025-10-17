import React, { useCallback } from 'react';
import { Table, Button, Tag, Space, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import TemoinActions from './TemoinActions';
import TemoinDetails from './TemoinDetails';

/**
 * Component for rendering the temoins table with expandable rows
 */
const TemoinTable = ({
  dataSource,
  loading,
  pagination,
  expandedRowKeys,
  selectedTemoin,
  userRole,
  getLabel,
  getFullImageUrl,
  onRowClick,
  onExpand,
  onTableChange,
  onEdit,
  onDelete,
  onValidate
}) => {
  // Define table columns
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
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onRowClick(record);
            }}
            title="Voir les détails"
          />
          
          {userRole === 'superadmin' && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
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
                onDelete(record);
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
      ),
    },
  ];

  // Expanded row render function
  const expandedRowRender = useCallback((record) => (
    <>
      <TemoinActions
        record={record}
        userRole={userRole}
        onValidate={onValidate}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <TemoinDetails
        record={record}
        getLabel={getLabel}
        getFullImageUrl={getFullImageUrl}
      />
    </>
  ), [userRole, onValidate, onEdit, onDelete, getLabel, getFullImageUrl]);

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1500 }}
      pagination={pagination}
      onChange={onTableChange}
      expandable={{
        expandedRowRender,
        expandedRowKeys,
        onExpand: (expanded, record) => {
          onExpand(expanded, record);
        },
      }}
      onRow={(record) => ({
        onClick: () => onRowClick(record),
        style: { 
          cursor: 'pointer',
          background: selectedTemoin?.id === record.id ? '#e6f7ff' : 'white'
        },
      })}
    />
  );
};

export default TemoinTable;

