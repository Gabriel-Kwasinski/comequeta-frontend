import { Link } from 'react-router-dom'
import './TermsPage.css'

/**
 * Draft Terms of Use / privacy notice (SCRUM-46). Placeholder content for the
 * academic project — to be reviewed before any real launch.
 */
function TermsPage() {
  return (
    <main className="terms-page">
      <h1>Termos de Uso e Privacidade</h1>
      <p className="terms-page__draft">
        Rascunho — documento provisório para fins acadêmicos.
      </p>

      <section>
        <h2>1. Aceitação</h2>
        <p>
          Ao criar uma conta no Comé que Tá, você declara ter lido e concordado
          com estes Termos de Uso e com a Política de Privacidade descrita
          abaixo.
        </p>
      </section>

      <section>
        <h2>2. Uso do aplicativo</h2>
        <p>
          O aplicativo permite visualizar vizinhos próximos em um mapa e trocar
          mensagens. Você se compromete a utilizá-lo de forma respeitosa e a não
          publicar conteúdo ilícito, ofensivo ou que viole direitos de
          terceiros.
        </p>
      </section>

      <section>
        <h2>3. Dados pessoais (LGPD)</h2>
        <p>
          Coletamos os dados estritamente necessários ao funcionamento do app
          (nome, e-mail e localização aproximada). Os dados são tratados de
          acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Você
          pode solicitar a correção ou exclusão dos seus dados a qualquer
          momento.
        </p>
      </section>

      <section>
        <h2>4. Localização</h2>
        <p>
          A localização é usada apenas para mostrar e ser mostrado a usuários
          dentro do seu raio de proximidade. Você controla quando compartilhar
          sua posição.
        </p>
      </section>

      <section>
        <h2>5. Contato</h2>
        <p>
          Dúvidas sobre estes termos podem ser encaminhadas à equipe do projeto.
        </p>
      </section>

      <p className="terms-page__back">
        <Link to="/signup">Voltar ao cadastro</Link>
      </p>
    </main>
  )
}

export default TermsPage
