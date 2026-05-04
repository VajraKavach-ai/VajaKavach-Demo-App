interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface AdminProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

const AdminProductTable = ({ products, onEdit, onDelete }: AdminProductTableProps) => (
  <table className="vk-admin-table">
    <thead>
      <tr>
        <th>Image</th>
        <th>Name</th>
        <th>Description</th>
        <th>Price</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {products.map(product => (
        <tr key={product.id}>
          <td><img src={product.image || '/placeholder.png'} alt={product.name} className="vk-admin-img" /></td>
          <td>{product.name}</td>
          <td>{product.description}</td>
          <td>${product.price.toFixed(2)}</td>
          <td>
            <button onClick={() => onEdit(product)} className="vk-admin-edit">Edit</button>
            <button onClick={() => onDelete(product.id)} className="vk-admin-delete">Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default AdminProductTable;
