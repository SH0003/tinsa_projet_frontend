import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Upload,
  Modal,
  Descriptions,
  Popconfirm
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from "@ant-design/icons";

const { Step } = Steps;

const compteOptions = [
  { label: "Banque", value: "banque" },
  { label: "Assurance", value: "assurance" }
];

const documentTypes = [
  "CP",
  "PC",
  "NR",
  "PA",
  "Photo",
  "Contrat Bail",
  "Compromis",
  "CC",
  "Marche",
  "Croquis",
  "Divers"
].map((type) => ({ label: type, value: type }));

const roleOptions = [
  { label: "Visiteur", value: "visiteur" },
  { label: "Elaborateur", value: "elaborateur" },
  { label: "Validateur", value: "validateur" }
];

const statutOptions = [
  { label: "En cours", value: "En cours" },
  { label: "Validé", value: "Validé" },
  { label: "Archivé", value: "Archivé" }
];

const initialTableData = [
  {
    key: "1",
    numero: "DOS-001",
    demandeur: "Société Atlas",
    prescripteur: "Banque",
    statut: "En cours",
    dateCreation: "01/11/2025",
    details: {
      demandeurType: "morale",
      demandeurRaisonSociale: "Société Atlas",
      demandeurIce: "ICE123456",
      demandeurAdresse: "123 Avenue Hassan II, Casablanca",
      bienAdresse: "Parcelle 45, Zone industrielle",
      bienLongitude: "-7.62",
      bienLatitude: "33.57",
      titresFonciers: [
        { tf: "TF123", registre: "Reg-45", conservation: "Casa Anfa" }
      ],
      prescripteurCompte: "banque",
      documents: [{ type: "CP", file: [] }],
      honnoraireHt: 25000,
      modalitePaiement: "accompte_50",
      utilisateurs: [
        { role: "validateur", nomRole: "Fatima Zahra" },
        { role: "elaborateur", nomRole: "Equipe Technique" }
      ]
    }
  },
  {
    key: "2",
    numero: "DOS-002",
    demandeur: "Youssef Benali",
    prescripteur: "Assurance",
    statut: "Validé",
    dateCreation: "24/10/2025",
    details: {
      demandeurType: "physique",
      demandeurIdentifiant: "CIN123456",
      demandeurPrenom: "Youssef",
      demandeurNom: "Benali",
      demandeurAdresse: "Rue des Fleurs, Rabat",
      bienAdresse: "Appartement 12, Avenue Mohammed V",
      bienLongitude: "-6.83",
      bienLatitude: "34.02",
      titresFonciers: [
        { tf: "TF987", registre: "Reg-11", conservation: "Rabat" }
      ],
      prescripteurCompte: "assurance",
      documents: [{ type: "PC", file: [] }],
      honnoraireHt: 18000,
      modalitePaiement: "remise_rapport",
      utilisateurs: [{ role: "visiteur", nomRole: "Le Client" }]
    }
  }
];

const STORAGE_KEY = "dossiersTableData";

const initialFilters = {
  search: "",
  prescripteur: undefined,
  statut: undefined
};

const getStatusColor = (statut) => {
  switch (statut) {
    case "Validé":
      return "green";
    case "Archivé":
      return "default";
    default:
      return "blue";
  }
};

const Dossiers = () => {
  const [creationForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [viewMode, setViewMode] = useState("list");
  const [currentStep, setCurrentStep] = useState(0);
  const [tableData, setTableData] = useState(() => {
    if (typeof window === "undefined") {
      return initialTableData;
    }

    const storedData = window.localStorage.getItem(STORAGE_KEY);

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);

        if (Array.isArray(parsedData)) {
          return parsedData;
        }
      } catch (error) {
        console.error("Erreur lors du chargement des dossiers:", error);
      }
    }

    return initialTableData;
  });
  const [filterValues, setFilterValues] = useState(initialFilters);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tableData));
  }, [tableData]);

  const demandeurType = Form.useWatch("demandeurType", creationForm) || "physique";

  const stepFieldGroups = useMemo(
    () => [
      () => {
        if (demandeurType === "physique") {
          return [
            "demandeurType",
            "demandeurIdentifiant",
            "demandeurPrenom",
            "demandeurNom",
            "demandeurAdresse"
          ];
        }
        return [
          "demandeurType",
          "demandeurRaisonSociale",
          "demandeurIce",
          "demandeurAdresse"
        ];
      },
      () => [
        "bienAdresse",
        "bienLongitude",
        "bienLatitude",
        ["titresFonciers"]
      ],
      () => ["prescripteurCompte"],
      () => ["documents"],
      () => ["honnoraireHt", "modalitePaiement"],
      () => ["utilisateurs"]
    ],
    [demandeurType]
  );

  const handleFilterChange = (_, allValues) => {
    setFilterValues(allValues);
  };

  const handleFilterReset = () => {
    filterForm.resetFields();
    setFilterValues(initialFilters);
  };

  const filteredData = useMemo(() => {
    return tableData.filter((item) => {
      const matchesSearch =
        !filterValues.search ||
        item.numero.toLowerCase().includes(filterValues.search.toLowerCase()) ||
        item.demandeur.toLowerCase().includes(filterValues.search.toLowerCase());

      const matchesPrescripteur =
        !filterValues.prescripteur ||
        item.prescripteur === filterValues.prescripteur;

      const matchesStatut =
        !filterValues.statut || item.statut === filterValues.statut;

      return matchesSearch && matchesPrescripteur && matchesStatut;
    });
  }, [tableData, filterValues]);

  const tableColumns = useMemo(
    () => [
      {
        title: "Numéro",
        dataIndex: "numero",
        key: "numero"
      },
      {
        title: "Demandeur",
        dataIndex: "demandeur",
        key: "demandeur"
      },
      {
        title: "Prescripteur",
        dataIndex: "prescripteur",
        key: "prescripteur"
      },
      {
        title: "Statut",
        dataIndex: "statut",
        key: "statut",
        render: (value) => <Tag color={getStatusColor(value)}>{value}</Tag>
      },
      {
        title: "Créé le",
        dataIndex: "dateCreation",
        key: "dateCreation"
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space size="small">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              title="Voir"
            />
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              title="Modifier"
            />
            <Popconfirm
              title="Supprimer ce dossier ?"
              okText="Oui"
              cancelText="Non"
              onConfirm={() => handleDelete(record.key)}
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                title="Supprimer"
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Space>
        )
      }
    ],
    []
  );

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  const handleNext = async () => {
    const fields = stepFieldGroups[currentStep]
      ? stepFieldGroups[currentStep]()
      : undefined;
    try {
      if (fields) {
        await creationForm.validateFields(fields);
      }
      setCurrentStep((prev) => prev + 1);
    } catch {
      // Erreurs gérées par Ant Design
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleOpenForm = () => {
    setViewMode("form");
    setCurrentStep(0);
    setEditingKey(null);
    creationForm.resetFields();
  };

  const handleCancelCreation = () => {
    setViewMode("list");
    setCurrentStep(0);
    setEditingKey(null);
    creationForm.resetFields();
  };

  const handleView = (record) => {
    setSelectedDossier(record);
    setIsViewModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingKey(record.key);
    setViewMode("form");
    setCurrentStep(0);
    creationForm.setFieldsValue({
      ...record.details
    });
  };

  const handleDelete = (key) => {
    setTableData((prev) => prev.filter((item) => item.key !== key));
    message.success("Dossier supprimé (simulation).");
  };

  const handleSubmit = async () => {
    try {
      await creationForm.validateFields();
      const values = creationForm.getFieldsValue(true);

      const prescripteurLabel =
        compteOptions.find((option) => option.value === values.prescripteurCompte)
          ?.label || values.prescripteurCompte;

      const demandeurLabel =
        values.demandeurType === "physique"
          ? `${values.demandeurPrenom || ""} ${values.demandeurNom || ""}`.trim()
          : values.demandeurRaisonSociale;

      setTableData((prev) => {
        if (editingKey) {
          return prev.map((item) => {
            if (item.key === editingKey) {
              return {
                ...item,
                demandeur: demandeurLabel,
                prescripteur: prescripteurLabel,
                details: values
              };
            }
            return item;
          });
        }

        const numero = `DOS-${String(prev.length + 1).padStart(3, "0")}`;
        const newEntry = {
          key: Date.now().toString(),
          numero,
          demandeur: demandeurLabel,
          prescripteur: prescripteurLabel,
          statut: "En cours",
          dateCreation: new Date().toLocaleDateString("fr-FR"),
          details: values
        };
        return [newEntry, ...prev];
      });

      message.success(
        editingKey
          ? "Le dossier a été mis à jour (simulation)."
          : "Le dossier a été enregistré (simulation)."
      );
      handleCancelCreation();
    } catch {
      message.error("Merci de vérifier les informations du formulaire.");
    }
  };

  if (viewMode === "list") {
    return (
      <Card
        title="Dossiers"
        bordered={false}
        style={{ margin: "24px" }}
        extra={
          <Button type="primary" onClick={handleOpenForm}>
            Ajouter un dossier
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={initialFilters}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16, rowGap: 12 }}
        >
          <Form.Item label="Recherche" name="search">
            <Input placeholder="Numéro ou demandeur" allowClear />
          </Form.Item>
          <Form.Item label="Prescripteur" name="prescripteur">
            <Select
              placeholder="Tous"
              allowClear
              options={compteOptions.map((option) => ({
                label: option.label,
                value: option.label
              }))}
              style={{ minWidth: 160 }}
            />
          </Form.Item>
          <Form.Item label="Statut" name="statut">
            <Select
              placeholder="Tous"
              allowClear
              options={statutOptions}
              style={{ minWidth: 140 }}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>Réinitialiser</Button>
          </Form.Item>
        </Form>

        <div style={{ overflowX: "auto" }}>
          <Table
            columns={tableColumns}
            dataSource={filteredData}
            rowKey="key"
            pagination={{ pageSize: 5 }}
            scroll={{ x: 900 }}
          />
        </div>
        <Modal
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          title={`Dossier ${selectedDossier?.numero || ""}`}
          footer={<Button onClick={() => setIsViewModalVisible(false)}>Fermer</Button>}
          width={720}
        >
          {selectedDossier && (
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Numéro">{selectedDossier.numero}</Descriptions.Item>
              <Descriptions.Item label="Statut">
                <Tag color={getStatusColor(selectedDossier.statut)}>
                  {selectedDossier.statut}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Demandeur" span={2}>
                {selectedDossier.demandeur}
              </Descriptions.Item>
              <Descriptions.Item label="Prescripteur">
                {selectedDossier.prescripteur}
              </Descriptions.Item>
              <Descriptions.Item label="Créé le">
                {selectedDossier.dateCreation}
              </Descriptions.Item>
              <Descriptions.Item label="Type de demandeur" span={2}>
                {selectedDossier.details.demandeurType === "physique" ? "Physique" : "Morale"}
              </Descriptions.Item>
              {selectedDossier.details.demandeurType === "physique" ? (
                <>
                  <Descriptions.Item label="Identifiant">
                    {selectedDossier.details.demandeurIdentifiant || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nom complet">
                    {`${selectedDossier.details.demandeurPrenom || ""} ${selectedDossier.details.demandeurNom || ""}`.trim() || "-"}
                  </Descriptions.Item>
                </>
              ) : (
                <>
                  <Descriptions.Item label="Raison sociale">
                    {selectedDossier.details.demandeurRaisonSociale || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="ICE">
                    {selectedDossier.details.demandeurIce || "-"}
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Adresse demandeur" span={2}>
                {selectedDossier.details.demandeurAdresse || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Adresse du bien" span={2}>
                {selectedDossier.details.bienAdresse || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Longitude">
                {selectedDossier.details.bienLongitude || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Latitude">
                {selectedDossier.details.bienLatitude || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Titres fonciers" span={2}>
                <Space direction="vertical">
                  {(selectedDossier.details.titresFonciers || []).map((tf, index) => (
                    <Tag key={index}>{`${tf.tf || "-"} / ${tf.registre || "-"} / ${tf.conservation || "-"}`}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Modalité paiement">
                {selectedDossier.details.modalitePaiement || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Honoraires HT">
                {selectedDossier.details.honnoraireHt
                  ? `${selectedDossier.details.honnoraireHt} MAD`
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Documents" span={2}>
                <Space direction="vertical">
                  {(selectedDossier.details.documents || []).map((doc, index) => (
                    <Tag key={index}>{doc.type || "-"}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Utilisateurs" span={2}>
                <Space direction="vertical">
                  {(selectedDossier.details.utilisateurs || []).map((user, index) => (
                    <Tag key={index}>{`${user.role || "-"} - ${user.nomRole || "-"}`}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Card>
    );
  }

  return (
    <Card
      title="Création d'un dossier"
      bordered={false}
      style={{ margin: "24px" }}
      extra={
        <Button onClick={handleCancelCreation}>Retour à la liste</Button>
      }
    >
      <Steps current={currentStep} responsive>
        <Step title="Demandeur" />
        <Step title="Bien" />
        <Step title="Prescripteur" />
        <Step title="Documentation" />
        <Step title="Honoraires" />
        <Step title="Utilisateurs" />
      </Steps>

      <Divider />

      <Form
        form={creationForm}
        layout="vertical"
        initialValues={{
          demandeurType: "physique",
          titresFonciers: [{ tf: "", registre: "", conservation: "" }],
          documents: [{ type: "CP", file: [] }],
          utilisateurs: [{ role: "visiteur", nomRole: "" }]
        }}
      >
        {currentStep === 0 && (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Form.Item
              name="demandeurType"
              label="Type de demandeur"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio value="physique">Physique</Radio>
                <Radio value="morale">Morale</Radio>
              </Radio.Group>
            </Form.Item>

            {demandeurType === "physique" ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Form.Item
                  name="demandeurIdentifiant"
                  label="Identifiant"
                  rules={[{ required: true, message: "Identifiant requis" }]}
                >
                  <Input placeholder="Identifiant national, CIN..." />
                </Form.Item>
                <Form.Item
                  name="demandeurPrenom"
                  label="Prénom"
                  rules={[{ required: true, message: "Prénom requis" }]}
                >
                  <Input placeholder="Prénom du demandeur" />
                </Form.Item>
                <Form.Item
                  name="demandeurNom"
                  label="Nom"
                  rules={[{ required: true, message: "Nom requis" }]}
                >
                  <Input placeholder="Nom du demandeur" />
                </Form.Item>
              </Space>
            ) : (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Form.Item
                  name="demandeurRaisonSociale"
                  label="Raison sociale"
                  rules={[{ required: true, message: "Raison sociale requise" }]}
                >
                  <Input placeholder="Raison sociale de l'entreprise" />
                </Form.Item>
                <Form.Item
                  name="demandeurIce"
                  label="ICE"
                  rules={[{ required: true, message: "ICE requis" }]}
                >
                  <Input placeholder="Identifiant Commun de l'Entreprise" />
                </Form.Item>
              </Space>
            )}

            <Form.Item
              name="demandeurAdresse"
              label="Adresse"
              rules={[{ required: true, message: "Adresse requise" }]}
            >
              <Input.TextArea rows={3} placeholder="Adresse complète" />
            </Form.Item>
          </Space>
        )}

        {currentStep === 1 && (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Form.Item
              name="bienAdresse"
              label="Adresse du bien"
              rules={[{ required: true, message: "Adresse requise" }]}
            >
              <Input.TextArea rows={3} placeholder="Adresse complète du bien" />
            </Form.Item>
            <Space size="large" style={{ width: "100%" }}>
              <Form.Item
                name="bienLongitude"
                label="Longitude"
                style={{ flex: 1 }}
                rules={[{ required: true, message: "Longitude requise" }]}
              >
                <Input placeholder="Ex : -7.589" />
              </Form.Item>
              <Form.Item
                name="bienLatitude"
                label="Latitude"
                style={{ flex: 1 }}
                rules={[{ required: true, message: "Latitude requise" }]}
              >
                <Input placeholder="Ex : 33.573" />
              </Form.Item>
            </Space>

            <Form.List
              name="titresFonciers"
              rules={[
                {
                  validator: async (_, entries) => {
                    if (!entries || entries.length === 0) {
                      return Promise.reject(
                        new Error("Ajouter au moins un titre foncier")
                      );
                    }
                  }
                }
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card
                        key={key}
                        type="inner"
                        title={`Titre foncier ${name + 1}`}
                        extra={
                          fields.length > 1 ? (
                            <Button
                              type="link"
                              danger
                              onClick={() => remove(name)}
                            >
                              Supprimer
                            </Button>
                          ) : null
                        }
                      >
                        <Space size="large" style={{ width: "100%" }}>
                          <Form.Item
                            {...restField}
                            name={[name, "tf"]}
                            label="TF"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: "TF requis" }]}
                          >
                            <Input placeholder="Numéro de TF" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "registre"]}
                            label="Registre"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: "Registre requis" }]}
                          >
                            <Input placeholder="Registre foncier" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "conservation"]}
                            label="Conservation"
                            style={{ flex: 1 }}
                            rules={[
                              { required: true, message: "Conservation requise" }
                            ]}
                          >
                            <Input placeholder="Conservation foncière" />
                          </Form.Item>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                  <Form.ErrorList errors={errors} />
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      add({ tf: "", registre: "", conservation: "" })
                    }
                    block
                  >
                    Ajouter un titre foncier
                  </Button>
                </>
              )}
            </Form.List>
          </Space>
        )}

        {currentStep === 2 && (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Form.Item
              name="prescripteurCompte"
              label="Compte prescripteur"
              rules={[{ required: true, message: "Sélectionner un compte" }]}
            >
              <Select
                placeholder="Sélectionner le prescripteur"
                options={compteOptions}
              />
            </Form.Item>
          </Space>
        )}

        {currentStep === 3 && (
          <Form.List
            name="documents"
            rules={[
              {
                validator: async (_, docs) => {
                  if (!docs || docs.length === 0) {
                    return Promise.reject(
                      new Error("Ajouter au moins un document")
                    );
                  }
                }
              }
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      type="inner"
                      title={`Document ${name + 1}`}
                      extra={
                        fields.length > 1 ? (
                          <Button
                            type="link"
                            danger
                            onClick={() => remove(name)}
                          >
                            Supprimer
                          </Button>
                        ) : null
                      }
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "type"]}
                        label="Type de document"
                        rules={[{ required: true, message: "Type requis" }]}
                      >
                        <Select
                          placeholder="Choisir un type"
                          options={documentTypes}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "file"]}
                        label="Fichier"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[{ required: true, message: "Fichier requis" }]}
                      >
                        <Upload maxCount={1} beforeUpload={() => false}>
                          <Button icon={<UploadOutlined />}>
                            Sélectionner un fichier
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Card>
                  ))}
                </Space>
                <Form.ErrorList errors={errors} />
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add({ type: "CP", file: [] })}
                  block
                >
                  Ajouter un document
                </Button>
              </>
            )}
          </Form.List>
        )}

        {currentStep === 4 && (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Form.Item
              name="honnoraireHt"
              label="Honoraires HT"
              rules={[{ required: true, message: "Montant requis" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                step={100}
                placeholder="Montant des honoraires HT"
                addonAfter="MAD"
              />
            </Form.Item>
            <Form.Item
              name="modalitePaiement"
              label="Modalité de paiement"
              rules={[{ required: true, message: "Sélectionner une modalité" }]}
            >
              <Select
                placeholder="Choisir une modalité"
                options={[
                  { label: "Accompte 100 %", value: "accompte_100" },
                  { label: "Accompte 50 %", value: "accompte_50" },
                  { label: "À la remise du rapport", value: "remise_rapport" }
                ]}
              />
            </Form.Item>
          </Space>
        )}

        {currentStep === 5 && (
          <Form.List
            name="utilisateurs"
            rules={[
              {
                validator: async (_, users) => {
                  if (!users || users.length === 0) {
                    return Promise.reject(
                      new Error("Ajouter au moins un utilisateur")
                    );
                  }
                }
              }
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      type="inner"
                      title={`Utilisateur ${name + 1}`}
                      extra={
                        fields.length > 1 ? (
                          <Button
                            type="link"
                            danger
                            onClick={() => remove(name)}
                          >
                            Supprimer
                          </Button>
                        ) : null
                      }
                    >
                      <Space size="large" style={{ width: "100%" }}>
                        <Form.Item
                          {...restField}
                          name={[name, "role"]}
                          label="Rôle"
                          style={{ flex: 1 }}
                          rules={[{ required: true, message: "Rôle requis" }]}
                        >
                          <Select
                            placeholder="Choisir un rôle"
                            options={roleOptions}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "nomRole"]}
                          label="Nom de rôle"
                          style={{ flex: 1 }}
                          rules={[{ required: true, message: "Nom requis" }]}
                        >
                          <Input placeholder="Nom ou utilisateur assigné" />
                        </Form.Item>
                      </Space>
                    </Card>
                  ))}
                </Space>
                <Form.ErrorList errors={errors} />
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add({ role: "visiteur", nomRole: "" })}
                  block
                >
                  Ajouter un utilisateur
                </Button>
              </>
            )}
          </Form.List>
        )}
      </Form>

      <Divider />

      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Space>
          <Button onClick={handlePrev} disabled={currentStep === 0}>
            Étape précédente
          </Button>
          <Button onClick={handleCancelCreation}>Annuler</Button>
        </Space>
        {currentStep < 5 ? (
          <Button type="primary" onClick={handleNext}>
            Étape suivante
          </Button>
        ) : (
          <Button type="primary" onClick={handleSubmit}>
            Enregistrer le dossier
          </Button>
        )}
      </Space>
    </Card>
  );
};

export default Dossiers;
