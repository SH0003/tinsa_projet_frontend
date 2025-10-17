import React, { useMemo } from 'react';
import { Row, Col, Select, Button, DatePicker } from 'antd';

const { Option } = Select;

/**
 * Component for filtering temoins
 */
const TemoinFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
  // Data options
  regions = [],
  provinces = [],
  communes = [],
  typologies = [],
  typeOperations = [],
  // Loading states
  loadingProvinces = false,
  loadingCommunes = false,
  loadingOptions = false,
  // Geographic handlers
  onRegionChange,
  onProvinceChange
}) => {
  const handleRegionChange = (value) => {
    onFilterChange('region', value);
    onFilterChange('province', null);
    onFilterChange('commune', null);
    onRegionChange?.(value);
  };

  const handleProvinceChange = (value) => {
    onFilterChange('province', value);
    onFilterChange('commune', null);
    onProvinceChange?.(filters.region, value);
  };

  return (
    <Row gutter={[12, 12]}>
      {/* Validation Status Filter */}
      <Col xs={24} sm={12} md={8} lg={3}>
        <Select
          placeholder="État de validation"
          style={{ width: '100%' }}
          allowClear
          value={filters.validation}
          onChange={(value) => onFilterChange('validation', value)}
        >
          <Option value={true}>Validé</Option>
          <Option value={false}>En attente</Option>
        </Select>
      </Col>

      {/* Region Filter */}
      <Col xs={24} sm={12} md={8} lg={3}>
        <Select
          placeholder="Région"
          style={{ width: '100%' }}
          allowClear
          value={filters.region}
          onChange={handleRegionChange}
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

      {/* Province Filter */}
      <Col xs={24} sm={12} md={8} lg={3}>
        <Select
          placeholder="Province"
          style={{ width: '100%' }}
          allowClear
          value={filters.province}
          onChange={handleProvinceChange}
          disabled={!filters.region}
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

      {/* Commune Filter */}
      <Col xs={24} sm={12} md={8} lg={3}>
        <Select
          placeholder="Commune"
          style={{ width: '100%' }}
          allowClear
          value={filters.commune}
          onChange={(value) => onFilterChange('commune', value)}
          disabled={!filters.province}
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

      {/* Type Operation Filter */}
      <Col xs={24} sm={12} md={8} lg={3}>
        <Select
          placeholder="Type d'opération"
          style={{ width: '100%' }}
          allowClear
          value={filters.typeOperation}
          onChange={(value) => onFilterChange('typeOperation', value)}
          loading={loadingOptions}
        >
          {typeOperations.map(opt => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      </Col>

      {/* Typologie Filter */}
      <Col xs={24} sm={12} md={8} lg={3}>
        <Select
          placeholder="Typologie"
          style={{ width: '100%' }}
          allowClear
          value={filters.typologie}
          onChange={(value) => onFilterChange('typologie', value)}
        >
          {typologies.map(typo => (
            <Option key={typo} value={typo}>
              {typo}
            </Option>
          ))}
        </Select>
      </Col>

      {/* Date Start Filter */}
      <Col xs={24} sm={12} md={8} lg={4}>
        <DatePicker
          placeholder="Date début"
          style={{ width: '100%' }}
          allowClear
          value={filters.dateStart}
          onChange={(value) => onFilterChange('dateStart', value)}
          format="DD/MM/YYYY"
        />
      </Col>

      {/* Date End Filter */}
      <Col xs={24} sm={12} md={8} lg={4}>
        <DatePicker
          placeholder="Date fin"
          style={{ width: '100%' }}
          allowClear
          value={filters.dateEnd}
          onChange={(value) => onFilterChange('dateEnd', value)}
          format="DD/MM/YYYY"
        />
      </Col>

      {/* Reset Button */}
      <Col xs={24} sm={12} md={8} lg={3}>
        <Button onClick={onResetFilters} style={{ width: '100%' }}>
          Réinitialiser
        </Button>
      </Col>
    </Row>
  );
};

export default TemoinFilters;

