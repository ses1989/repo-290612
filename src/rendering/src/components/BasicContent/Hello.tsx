import { ComponentProps } from 'lib/component-props';

type HelloProps = ComponentProps & {
  fields: {
    name: string;
    date: string;
    hello: string;
  };
};

const Hello = ({ fields }: HelloProps): JSX.Element => (
  <div className="container">
    <h2 className="is-size-2 has-text-centered">Hello Component</h2>
    <p>
      datasource name: {fields.name}
      <br />
      date: {fields.date}
      <br />
      hello: {fields.hello}
    </p>
  </div>
);

export default Hello;
