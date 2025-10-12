import React, { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Button, Row, Col, Upload, message, Collapse, Spin } from 'antd';
import { UploadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import axios from '../../utils/axios';
import TemoinMapSelector from './TemoinMapSelector';

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const TemoinForm = ({ form, onSubmit, onCancel, editMode }) => {
  const [images, setImages] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeKeys, setActiveKeys] = useState(['1']);
  const [loadingAddress, setLoadingAddress] = useState(false); 
  const [options, setOptions] = useState({
    type_operation: [],
    orientation: [],
    vues: [],
    qualite_construction: [],
    niveau_standing: [],
    etat_conservation: [],
    source_temoin: []
  });
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // ✅ État uniquement pour gérer l'affichage (parcelle grisée ou non)
  const [typologieBien, setTypologieBien] = useState(null);

  // Récupérer les options depuis l'API au chargement
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get('/api/temoins/options/');
        setOptions(response.data);
        setLoadingOptions(false);
      } catch (error) {
        console.error('Erreur lors du chargement des options:', error);
        message.error('Erreur lors du chargement des options du formulaire');
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  
  useEffect(() => {
    if (editMode) {
      const existingImages = form.getFieldValue('images');
      console.log('🔍 Images existantes:', existingImages);
      
      if (existingImages && Array.isArray(existingImages) && existingImages.length > 0) {
        const imageObjects = existingImages.map((url, index) => {
          // Construire l'URL complète avec le domaine backend
          let fullUrl = url;
          if (url.startsWith('/media/')) {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
            fullUrl = `${apiUrl}${url}`;
          }
          
          console.log(`📸 Image ${index + 1} URL:`, fullUrl);
          
          return {
            uid: `existing-${index}`,
            name: url.split('/').pop() || `image-${index + 1}.png`,
            status: 'done',
            url: fullUrl,
            thumbUrl: fullUrl,
            type: 'image/png',
          };
        });
        
        setImages(imageObjects);
        console.log('✅ Images configurées:', imageObjects);
      } else {
        setImages([]);
      }
      
      // Initialiser la typologie en mode édition
      const typologie = form.getFieldValue('typologie_bien');
      if (typologie) {
        setTypologieBien(typologie);
      }
    } else {
      setImages([]);
      setTypologieBien(null);
    }
  }, [editMode, form]);

  // Récupérer les valeurs initiales pour la carte
  const initialLatitude = form.getFieldValue('latitude');
  const initialLongitude = form.getFieldValue('longitude');

  // Fonction de géolocalisation inverse (Nominatim OpenStreetMap)
  const reverseGeocode = async (lat, lng) => {
    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        
        // Extraire les informations d'adresse
        const commune = address.city || address.town || address.village || address.municipality || '';
        const province = address.state || address.province || '';
        const region = address.region || address.state_district || '';
        const road = address.road || address.street || '';
        const suburb = address.suburb || address.neighbourhood || '';
        
        // Construire l'adresse complète
        let adresseComplete = '';
        if (road) adresseComplete += road;
        if (suburb) adresseComplete += (adresseComplete ? ', ' : '') + suburb;
        if (commune) adresseComplete += (adresseComplete ? ', ' : '') + commune;
        
        // Mettre à jour le formulaire
        form.setFieldsValue({
          region: region || 'Grand Casablanca-Settat',
          province: province || 'Casablanca',
          commune: commune || '',
          adresse_generee: adresseComplete || data.display_name || '',
        });
        
        message.success('Adresse récupérée avec succès');
        console.log('📍 Adresse récupérée:', data);
      } else {
        message.warning('Impossible de récupérer l\'adresse pour cette position');
      }
    } catch (error) {
      console.error('Erreur de géolocalisation inverse:', error);
      message.error('Erreur lors de la récupération de l\'adresse');
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleSubmit = (values) => {
    // Validation : vérifier que les champs requis sont remplis
    if (!values.latitude || !values.longitude) {
      message.error('Veuillez sélectionner une localisation sur la carte');
      setActiveKeys(['1']);
      return;
    }

    // ✅ Si parcelle est disabled, s'assurer qu'elle est null
    if (['Appartement', 'Bureau', 'Local Commercial'].includes(values.typologie_bien)) {
      values.parcelle = null;
    }

    // Ajouter les images au formulaire (préserver les URLs existantes)
    const formData = {
      ...values,
      images: images.map(img => {
        // Si l'image a déjà une URL (image existante), on la garde
        if (img.url && !img.url.startsWith('data:image')) {
          return img.url;
        }
        // Sinon c'est une nouvelle image en base64
        return img.url;
      }),
      latitude: selectedLocation?.lat || values.latitude,
      longitude: selectedLocation?.lng || values.longitude,
    };
    
    console.log('📤 Soumission avec images:', formData.images);
    onSubmit(formData);
  };

  // Gérer la sélection sur la carte avec géolocalisation inverse
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    form.setFieldsValue({
      latitude: location.lat,
      longitude: location.lng,
    });
    message.success('Localisation sélectionnée sur la carte');
    
    // Déclencher la géolocalisation inverse automatiquement
    reverseGeocode(location.lat, location.lng);
  };

  // Gérer le changement manuel des coordonnées
  const handleCoordinateChange = (field, value) => {
    const currentLat = form.getFieldValue('latitude');
    const currentLng = form.getFieldValue('longitude');
    
    let newLat = currentLat;
    let newLng = currentLng;
    
    if (field === 'latitude') {
      newLat = value;
    } else {
      newLng = value;
    }
    
    // Si les deux coordonnées sont renseignées, mettre à jour la carte
    if (newLat && newLng && !isNaN(newLat) && !isNaN(newLng)) {
      setSelectedLocation({ lat: newLat, lng: newLng });
    }
  };

  // Bouton pour déclencher manuellement la géolocalisation inverse
  const handleReverseGeocodeClick = () => {
    const lat = form.getFieldValue('latitude');
    const lng = form.getFieldValue('longitude');
    
    if (!lat || !lng) {
      message.warning('Veuillez d\'abord saisir les coordonnées GPS');
      return;
    }
    
    reverseGeocode(lat, lng);
  };

  const uploadProps = {
    onRemove: (file) => {
      console.log('Suppression image:', file);
      setImages(images.filter(img => img.uid !== file.uid));
    },
    onPreview: (file) => {
      const url = file.url || file.thumbUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Vous ne pouvez télécharger que des images!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('L\'image doit faire moins de 5MB!');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: e.target.result,
          thumbUrl: e.target.result,
        };
        console.log('Nouvelle image ajoutée:', newImage.name);
        setImages([...images, newImage]);
      };
      reader.readAsDataURL(file);
      return false;
    },
    fileList: images,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
  };

  const handleCollapseChange = (keys) => {
    setActiveKeys(keys);
  };

  if (loadingOptions) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Chargement du formulaire..." />
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      scrollToFirstError
    >
      <Collapse 
        activeKey={activeKeys} 
        onChange={handleCollapseChange}
        style={{ 
          marginBottom: 16,
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #e8e8e8'
        }}
      >
        {/* ==================== SECTION 1 : ADRESSE ==================== */}
        <Panel 
          header={<strong style={{ fontSize: '15px' }}>1. Adresse et Localisation</strong>}
          key="1"
          style={{ 
            borderBottom: '1px solid #f0f0f0'
          }}
        >

          {/* CARTE INTERACTIVE */}
          <div style={{ 
            background: '#fafafa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <TemoinMapSelector
              onLocationSelect={handleLocationSelect}
              initialPosition={
                initialLatitude && initialLongitude
                  ? { lat: parseFloat(initialLatitude), lng: parseFloat(initialLongitude) }
                  : null
              }
            />
          </div>

          {/* Coordonnées GPS avec saisie manuelle activée */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="latitude" 
                label="Latitude"
                rules={[{ required: true, message: 'Latitude requise' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Ex: 33.5731"
                  step={0.000001}
                  onChange={(value) => handleCoordinateChange('latitude', value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="longitude" 
                label="Longitude"
                rules={[{ required: true, message: 'Longitude requise' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Ex: -7.5898"
                  step={0.000001}
                  onChange={(value) => handleCoordinateChange('longitude', value)}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Bouton pour géolocalisation inverse manuelle */}
          <div style={{ marginBottom: '16px' }}>
            <Button 
              icon={<EnvironmentOutlined />}
              onClick={handleReverseGeocodeClick}
              loading={loadingAddress}
              type="dashed"
              block
            >
              {loadingAddress ? 'Récupération de l\'adresse...' : 'Obtenir l\'adresse depuis les coordonnées'}
            </Button>
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="region" label="Région">
                <Input placeholder="Ex: Casablanca-Settat" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="province" label="Province">
                <Input placeholder="Ex: Casablanca" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="commune" 
                label="Commune" 
                rules={[{ required: true, message: 'Commune requise' }]}
              >
                <Input placeholder="Ex: Anfa" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="adresse_generee" label="Adresse complète">
            <TextArea rows={2} placeholder="Adresse détaillée du bien (remplie automatiquement)" />
          </Form.Item>
        </Panel>

        {/* ==================== SECTION 2 : TYPE DE TÉMOIN ==================== */}
        <Panel 
          header={<strong style={{ fontSize: '15px' }}>2. Type de Témoin</strong>}
          key="2"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="type_operation" 
                label="Type d'opération"
                rules={[{ required: true, message: 'Type d\'opération requis' }]}
              >
                <Select placeholder="Sélectionner">
                  {options.type_operation.map(opt => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="typologie_bien" 
                label="Typologie du bien"
                rules={[{ required: true, message: 'Typologie requise' }]}
              >
                <Select 
                  placeholder="Sélectionner"
                  onChange={(value) => {
                    setTypologieBien(value);
                    
                    // Si on sélectionne Appartement/Bureau/Local, vider la parcelle
                    if (['Appartement', 'Bureau', 'Local Commercial'].includes(value)) {
                      form.setFieldsValue({ parcelle: null });
                    }
                  }}
                >
                  <Option value="Appartement">Appartement</Option>
                  <Option value="Villa">Villa</Option>
                  <Option value="Bureau">Bureau</Option>
                  <Option value="Local Commercial">Local Commercial</Option>
                  <Option value="Terrain">Terrain</Option>
                  <Option value="Autre">Autre</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="orientation" label="Orientation">
                <Select placeholder="Sélectionner">
                  {options.orientation.map(opt => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="niveau_standing" label="Niveau de Standing">
                <Select placeholder="Sélectionner">
                  {options.niveau_standing.map(opt => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vues" label="Vue">
                <Select placeholder="Sélectionner une vue">
                  {options.vues.map(opt => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qualite_urbain" label="Qualité urbaine">
                <Input placeholder="Ex: Zone résidentielle calme" />
              </Form.Item>
            </Col>
          </Row>
        </Panel>

        {/* ==================== SECTION 3 : TERRAIN ==================== */}
        <Panel 
          header={<strong style={{ fontSize: '15px' }}>3. Informations Terrain</strong>}
          key="3"
        >
          <Row gutter={16}>
            <Col span={24}>
              {/* ✅ Parcelle grisée pour Appartement/Bureau/Local Commercial */}
              <Form.Item name="parcelle" label="Surface de la parcelle (m²)">
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0}
                  disabled={['Appartement', 'Bureau', 'Local Commercial'].includes(typologieBien)}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={value => value.replace(/\s/g, '')}
                  placeholder={
                    ['Appartement', 'Bureau', 'Local Commercial'].includes(typologieBien) 
                      ? "Non applicable pour ce type de bien" 
                      : "Surface totale du terrain"
                  }
                />
                {['Appartement', 'Bureau', 'Local Commercial'].includes(typologieBien) && (
                  <small style={{ color: '#999', fontStyle: 'italic' }}>
                    ⓘ Ce champ n'est pas applicable pour les Appartements, Bureaux et Locaux Commerciaux
                  </small>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Panel>

        {/* ==================== SECTION 4 : CONSTRUCTION ==================== */}
        <Panel 
          header={<strong style={{ fontSize: '15px' }}>4. Caractéristiques de Construction</strong>}
          key="4"
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="surface_vendable" label="Surface vendable (m²)">
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={value => value.replace(/\s/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="surface_jardin_privatif" label="Surface jardin (m²)">
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={value => value.replace(/\s/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="nombre_niveaux" label="Nombre de niveaux">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="chambres" label="Chambres">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="salle_bain" label="Salles de bain">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="pieces_total" label="Pièces total">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="pieces_exterieures" label="Pièces extérieures">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="etage_sous_sol" label="Étages sous-sol">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="age" label="Année du construction">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="qualite_construction" label="Qualité de construction">
                <Select placeholder="Sélectionner une qualité">
                  {options.qualite_construction.map(opt => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="etat_conservation" label="État de conservation">
                <Select placeholder="Sélectionner">
                  {options.etat_conservation.map(opt => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Panel>

        {/* ==================== SECTION 5 : PRIX HT ==================== */}
        <Panel 
          header={<strong style={{ fontSize: '15px' }}>5. Informations Financières (Prix HT)</strong>}
          key="5"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="valeur_offerte" 
                label="Valeur Offerte (DH HT)"
                rules={[{ required: true, message: 'Valeur offerte requise' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={value => value.replace(/\s/g, '')}
                  placeholder="Ex: 1 500 000"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* ✅ SIMPLIFIÉ : Juste un champ de saisie manuelle, toujours modifiable */}
              <Form.Item name="valeur_unitaire" label="Valeur Unitaire (DH/m²)">
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={value => value.replace(/\s/g, '')}
                  placeholder="Ex: 10 000"
                />
              </Form.Item>
            </Col>
          </Row>
        </Panel>

        {/* ==================== SECTION 6 : SOURCE ==================== */}
        <Panel 
          header={<strong style={{ fontSize: '15px' }}>6. Source du Témoin</strong>}
          key="6"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="source_temoin" label="Source du témoin">
                <Select placeholder="Sélectionner">
                  {options.source_temoin.map(opt => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="url_reference" label="URL de référence">
                <Input placeholder="https://..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="telephone" label="Téléphone">
                <Input placeholder="Ex: +212 600 000 000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contact" label="Contact">
                <Input placeholder="Nom du contact" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Images">
            <Upload {...uploadProps} listType="picture-card" multiple>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Ajouter</div>
              </div>
            </Upload>
            <small style={{ color: '#888', display: 'block', marginTop: '8px' }}>
              Maximum 5MB par image. {editMode && images.length > 0 && `${images.length} image(s) actuelle(s)`}
            </small>
          </Form.Item>
        </Panel>

        {/* ==================== SECTION 7 : OBSERVATION ==================== */}
        <Panel 
          header={<strong style={{ fontSize: '15px' }}>7. Observations</strong>}
          key="7"
        >
          <Form.Item name="observation" label="Observations">
            <TextArea rows={4} placeholder="Notes et remarques supplémentaires sur ce témoin" />
          </Form.Item>
        </Panel>
      </Collapse>

      {/* BOUTONS DE SOUMISSION */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '12px',
        marginTop: 24,
        paddingTop: 24,
        borderTop: '1px solid #f0f0f0'
      }}>
        <Button size="large" onClick={onCancel} style={{ minWidth: '120px' }}>
          Annuler
        </Button>
        <Button 
          type="primary"
          htmlType="submit" 
          size="large"
          style={{ minWidth: '180px' }}
        >
          {editMode ? 'Mettre à jour le Témoin' : 'Créer le Témoin'}
        </Button>
      </div>
    </Form>
  );
};

export default TemoinForm;