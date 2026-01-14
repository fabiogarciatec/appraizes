export const mockCategories = [
  { id: 1, name: 'Manuais', icon: 'Book', description: 'Guias passo a passo para utilizar o sistema.' },
  { id: 2, name: 'Solução de Problemas', icon: 'Build', description: 'Resoluções para erros comuns e falhas.' },
  { id: 3, name: 'FAQs', icon: 'Help', description: 'Perguntas frequentes sobre nossa plataforma.' },
  { id: 4, name: 'Atualizações', icon: 'Update', description: 'Notas de versão e novidades.' },
];

export const mockArticles = [
  {
    id: 1,
    title: 'Como cadastrar um novo equipamento',
    excerpt: 'Aprenda o passo a passo completo para registrar um novo equipamento no sistema, incluindo fotos e especificações técnicas.',
    content: `
      <h2>Introdução</h2>
      <p>O cadastro de equipamentos é fundamental para o controle da frota. Siga os passos abaixo para realizar um cadastro completo.</p>
      
      <h3>Passo 1: Acessar o Menu</h3>
      <p>No painel principal, clique em <strong>Equipamentos</strong> e depois em <strong>Novo Equipamento</strong>.</p>
      
      <h3>Passo 2: Preencher Dados Básicos</h3>
      <p>Informe o nome, modelo, marca e ano de fabricação. Estes campos são obrigatórios.</p>
      
      <blockquote>Dica: Tenha em mãos o número de série do motor e do chassi.</blockquote>
      
      <h3>Passo 3: Adicionar Fotos</h3>
      <p>Você pode carregar até 5 fotos do equipamento em diferentes ângulos.</p>
    `,
    category: 'Manuais',
    author: 'Suporte Técnico',
    date: '2023-10-15',
    views: 1540,
    readTime: '5 min',
    tags: ['equipamentos', 'cadastro', 'iniciantes']
  },
  {
    id: 2,
    title: 'Erro ao sincronizar dados offline',
    excerpt: 'O que fazer quando o aplicativo não envia os dados coletados sem internet.',
    content: `
      <h2>Diagnóstico</h2>
      <p>Se você receber uma mensagem de erro ao tentar sincronizar, verifique primeiro sua conexão.</p>
      
      <h3>Soluções Comuns</h3>
      <ul>
        <li>Verifique se o modo avião está desligado.</li>
        <li>Tente forçar o fechamento do app e abra novamente.</li>
        <li>Limpe o cache do aplicativo nas configurações do Android.</li>
      </ul>
    `,
    category: 'Solução de Problemas',
    author: 'Engenharia',
    date: '2023-11-02',
    views: 890,
    readTime: '3 min',
    tags: ['erro', 'offline', 'sync']
  },
  {
    id: 3,
    title: 'Política de privacidade e dados',
    excerpt: 'Entenda como seus dados são armazenados e protegidos em nossa infraestrutura.',
    content: '<p>Nossa política segue rigorosamente a LGPD...</p>',
    category: 'FAQs',
    author: 'Jurídico',
    date: '2023-09-10',
    views: 3200,
    readTime: '8 min',
    tags: ['lgpd', 'segurança', 'privacidade']
  },
  {
    id: 4,
    title: 'Novidades da versão 2.0',
    excerpt: 'Conheça o novo painel de gestão de combustíveis e as melhorias de performance.',
    content: '<p>Estamos felizes em anunciar a versão 2.0...</p>',
    category: 'Atualizações',
    author: 'Produto',
    date: '2023-12-01',
    views: 4500,
    readTime: '4 min',
    tags: ['release', 'v2.0', 'novidades']
  }
];
