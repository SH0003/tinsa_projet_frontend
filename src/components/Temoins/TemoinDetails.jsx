import React from 'react';
import { Row, Col, Card, Descriptions, Tag, Divider } from 'antd';

/**
 * Component for displaying detailed temoin information in expanded row
 */
const TemoinDetails = ({ record, getLabel, getFullImageUrl }) => {
  return (
    <div style={{ padding: '24px', background: '#fafafa' }}>
      <Row gutter={[24, 24]}>
        {/* Location Section */}
        <Col xs={24} lg={8}>
          <Card title="Localisation" style={{ height: '100%' }}>
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
                {record.latitude && record.longitude 
                  ? `${record.latitude}, ${record.longitude}` 
                  : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Property Characteristics Section */}
        <Col xs={24} lg={8}>
          <Card title="Caractéristiques du Bien" style={{ marginBottom: '16px' }}>
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
                {record.date_transaction 
                  ? new Date(record.date_transaction).toLocaleDateString('fr-FR') 
                  : 'N/A'}
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

        {/* Surfaces and Financial Section */}
        <Col xs={24} lg={8}>
          <Card title="Surfaces" style={{ marginBottom: '16px' }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Surface Parcelle">
                {record.parcelle 
                  ? `${parseFloat(record.parcelle).toLocaleString('fr-FR')} m²` 
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Surface Vendable">
                {record.surface_vendable 
                  ? `${parseFloat(record.surface_vendable).toLocaleString('fr-FR')} m²` 
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Surface Jardin">
                {record.surface_jardin_privatif 
                  ? `${parseFloat(record.surface_jardin_privatif).toLocaleString('fr-FR')} m²` 
                  : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Informations Financières">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Valeur Offerte (HT)">
                <strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {record.valeur_offerte 
                    ? `${parseFloat(record.valeur_offerte).toLocaleString('fr-FR')} DH` 
                    : 'N/A'}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Valeur Unitaire">
                {record.valeur_unitaire 
                  ? `${parseFloat(record.valeur_unitaire).toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} DH/m²` 
                  : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Images Section */}
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
                      console.error('Error loading image:', fullImageUrl);
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

      {/* Observation Section */}
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

      {/* Metadata Section */}
      {(record.created_at || record.updated_at) && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: '#fff', 
          borderRadius: '4px', 
          border: '1px solid #f0f0f0' 
        }}>
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

export default TemoinDetails;

