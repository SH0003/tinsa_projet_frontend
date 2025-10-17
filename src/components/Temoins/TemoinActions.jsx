import React from 'react';
import { Row, Col, Tag, Space, Button, Popconfirm } from 'antd';
import { CheckOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * Component for rendering action buttons in expanded row header
 */
const TemoinActions = ({ 
  record, 
  userRole, 
  onValidate, 
  onEdit, 
  onDelete 
}) => {
  return (
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
              onClick={() => onValidate(record.id)}
              style={{ background: '#52c41a' }}
            >
              Valider
            </Button>
          )}
          
          {userRole === 'superadmin' && (
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              disabled={record.is_validated}
            >
              Modifier
            </Button>
          )}
          
          {userRole === 'superadmin' && (
            <Popconfirm
              title="Supprimer ce témoin"
              description="Êtes-vous sûr de vouloir supprimer ce témoin ?"
              onConfirm={() => onDelete(record)}
              okText="Oui"
              cancelText="Non"
              okButtonProps={{ danger: true }}
              disabled={record.is_validated}
            >
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                disabled={record.is_validated}
              >
                Supprimer
              </Button>
            </Popconfirm>
          )}
        </Space>
      </Col>
    </Row>
  );
};

export default TemoinActions;

