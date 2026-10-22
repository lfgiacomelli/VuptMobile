export type CompanyDTO = {
    emp_codigo: number;
    emp_nome: string;
    emp_email: string;
    emp_telefone: string;
    emp_status: string;
    emp_cidade: string;
    emp_logradouro: string;
    emp_bairro: string;
    emp_numero: string;
    emp_cep: string;
    emp_cnpj: string | null;
    emp_created_at: string;
    emp_updated_at: string;
    emp_logotipo: string | null;
    atributos: AttributesDTO[];
};