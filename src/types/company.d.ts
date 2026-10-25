export type CompanyDTO = {
    emp_codigo: number;
    emp_nome: string;
    emp_email: string;
    emp_telefone: string;
    emp_status: string;
    end_cidade: string;
    end_logradouro: string;
    end_bairro: string;
    end_numero: string;
    end_cep: string;
    emp_cnpj: string | null;
    emp_created_at: string;
    emp_updated_at: string;
    emp_logotipo: string | null;
    atributos: AttributesDTO[];
};