from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta, datetime

app = Flask(__name__)
CORS(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Database Configuration (SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///restaurant.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize Extensions
jwt = JWTManager(app)
db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), nullable=False)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Staff(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    hours = db.Column(db.Integer, nullable=False)
    performance = db.Column(db.Integer, nullable=False)

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    popularity = db.Column(db.Integer, nullable=False)

class InventoryItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    low_stock = db.Column(db.Integer, nullable=False)

# New Order Models
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    waiter_name = db.Column(db.String(80), nullable=False)
    table_number = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(50), default='pending')  # pending, preparing, ready, delivered, paid
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    total_amount = db.Column(db.Float, default=0.0)
    
    # Relationship with OrderItems
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_item.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)  # Store name in case menu item changes
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price = db.Column(db.Float, nullable=False)  # Store price at time of order
    
    # Relationship with MenuItem for reference
    menu_item = db.relationship('MenuItem')

# Initialize DB and create manager if not exists
def create_manager():
    db.create_all()
    manager = User.query.filter_by(role='manager').first()
    if not manager:
        hashed_password = generate_password_hash('manager123')  # Default password
        manager = User(
            name='Default Manager',
            email='manager@example.com',
            password_hash=hashed_password,
            role='manager'
        )
        db.session.add(manager)
        db.session.commit()
        print("Default manager created")
    else:
        print("Manager already exists.")

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"success": False, "message": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.email)
        return jsonify({
            "success": True,
            "token": access_token,
            "user": {
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        })

    return jsonify({"success": False, "message": "Invalid credentials"}), 401

# Staff routes
@app.route('/staff', methods=['GET'])
@jwt_required()
def get_staff():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    
    if not user or user.role != 'manager':
        return jsonify({"success": False, "message": "Unauthorized access"}), 403
    
    staff_members = Staff.query.all()
    staff_list = [{
        'id': staff.id,
        'name': staff.name,
        'role': staff.role,
        'hours': staff.hours,
        'performance': staff.performance
    } for staff in staff_members]
    
    return jsonify({"success": True, "data": staff_list})

@app.route('/staff', methods=['POST'])
@jwt_required()
def add_staff():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    
    if not user or user.role != 'manager':
        return jsonify({"success": False, "message": "Unauthorized access"}), 403
    
    data = request.get_json()
    
    if not data or not all(key in data for key in ['name', 'role', 'hours', 'performance']):
        return jsonify({"success": False, "message": "Missing required staff information"}), 400
    
    new_staff = Staff(
        name=data['name'],
        role=data['role'],
        hours=data['hours'],
        performance=data['performance']
    )
    
    db.session.add(new_staff)
    db.session.commit()
    
    return jsonify({
        "success": True, 
        "message": "Staff member added successfully",
        "staff": {
            "id": new_staff.id,
            "name": new_staff.name,
            "role": new_staff.role,
            "hours": new_staff.hours,
            "performance": new_staff.performance
        }
    })

# Menu routes
@app.route('/menu', methods=['GET'])
def get_menu():
    # Removed JWT requirement for menu access to allow POS access
    menu_items = MenuItem.query.all()
    menu_list = [{
        'id': item.id,
        'name': item.name,
        'category': item.category,
        'price': item.price,
        'popularity': item.popularity
    } for item in menu_items]
    
    return jsonify({"success": True, "data": menu_list})

@app.route('/menu', methods=['POST'])
@jwt_required()
def add_menu_item():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    
    if not user or user.role != 'manager':
        return jsonify({"success": False, "message": "Unauthorized access"}), 403
    
    data = request.get_json()
    
    if not data or not all(key in data for key in ['name', 'category', 'price', 'popularity']):
        return jsonify({"success": False, "message": "Missing required menu item information"}), 400
    
    new_item = MenuItem(
        name=data['name'],
        category=data['category'],
        price=data['price'],
        popularity=data['popularity']
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({
        "success": True, 
        "message": "Menu item added successfully",
        "item": {
            "id": new_item.id,
            "name": new_item.name,
            "category": new_item.category,
            "price": new_item.price,
            "popularity": new_item.popularity
        }
    })

# Inventory routes
@app.route('/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    
    if not user or user.role != 'manager':
        return jsonify({"success": False, "message": "Unauthorized access"}), 403
    
    inventory_items = InventoryItem.query.all()
    inventory_list = [{
        'id': item.id,
        'name': item.name,
        'category': item.category,
        'quantity': item.quantity,
        'low_stock': item.low_stock
    } for item in inventory_items]
    
    return jsonify({"success": True, "data": inventory_list})

@app.route('/inventory', methods=['POST'])
@jwt_required()
def add_inventory_item():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    
    if not user or user.role != 'manager':
        return jsonify({"success": False, "message": "Unauthorized access"}), 403
    
    data = request.get_json()
    
    if not data or not all(key in data for key in ['name', 'category', 'quantity', 'low_stock']):
        return jsonify({"success": False, "message": "Missing required inventory item information"}), 400
    
    new_item = InventoryItem(
        name=data['name'],
        category=data['category'],
        quantity=data['quantity'],
        low_stock=data['low_stock']
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({
        "success": True, 
        "message": "Inventory item added successfully",
        "item": {
            "id": new_item.id,
            "name": new_item.name,
            "category": new_item.category,
            "quantity": new_item.quantity,
            "low_stock": new_item.low_stock
        }
    })

# New Order Routes
@app.route('/orders', methods=['GET'])
def get_orders():
    # Get status filter from query params if provided
    status = request.args.get('status')
    
    # Build the query
    query = Order.query
    if status:
        query = query.filter_by(status=status)
    
    # Execute the query with order by most recent first
    orders = query.order_by(Order.created_at.desc()).all()
    
    # Format the order data
    orders_list = []
    for order in orders:
        items = [{
            'id': item.id,
            'name': item.name,
            'quantity': item.quantity,
            'price': item.price,
            'total': item.price * item.quantity
        } for item in order.items]
        
        orders_list.append({
            'id': order.id,
            'waiter_name': order.waiter_name,
            'table_number': order.table_number,
            'status': order.status,
            'created_at': order.created_at.isoformat(),
            'updated_at': order.updated_at.isoformat(),
            'total_amount': order.total_amount,
            'items': items
        })
    
    return jsonify({"success": True, "data": orders_list})

@app.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = Order.query.get_or_404(order_id)
    
    items = [{
        'id': item.id,
        'name': item.name,
        'quantity': item.quantity,
        'price': item.price,
        'total': item.price * item.quantity
    } for item in order.items]
    
    order_data = {
        'id': order.id,
        'waiter_name': order.waiter_name,
        'table_number': order.table_number,
        'status': order.status,
        'created_at': order.created_at.isoformat(),
        'updated_at': order.updated_at.isoformat(),
        'total_amount': order.total_amount,
        'items': items
    }
    
    return jsonify({"success": True, "data": order_data})

@app.route('/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    
    if not data or not data.get('waiter_name') or not data.get('items') or len(data['items']) == 0:
        return jsonify({"success": False, "message": "Missing required order information"}), 400
    
    # Calculate total amount
    total_amount = 0
    for item in data['items']:
        total_amount += item.get('price', 0) * item.get('quantity', 1)
    
    # Create order
    new_order = Order(
        waiter_name=data['waiter_name'],
        table_number=data.get('table_number'),
        status='pending',
        total_amount=total_amount
    )
    
    db.session.add(new_order)
    db.session.flush()  # This assigns an ID to new_order without committing
    
    # Create order items
    for item_data in data['items']:
        # Find menu item if it exists
        menu_item = None
        menu_item_id = item_data.get('menu_item_id')
        if menu_item_id:
            menu_item = MenuItem.query.get(menu_item_id)
        
        # Create order item
        order_item = OrderItem(
            order_id=new_order.id,
            menu_item_id=menu_item.id if menu_item else None,
            name=item_data['name'],
            quantity=item_data.get('quantity', 1),
            price=item_data['price']
        )
        
        db.session.add(order_item)
    
    # Commit the transaction
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Order created successfully",
        "order": {
            "id": new_order.id,
            "waiter_name": new_order.waiter_name,
            "table_number": new_order.table_number,
            "status": new_order.status,
            "total_amount": new_order.total_amount,
            "created_at": new_order.created_at.isoformat()
        }
    }), 201

@app.route('/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    
    # Update order status if provided
    if 'status' in data:
        order.status = data['status']
    
    # Update table number if provided
    if 'table_number' in data:
        order.table_number = data['table_number']
    
    # Update waiter name if provided
    if 'waiter_name' in data:
        order.waiter_name = data['waiter_name']
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Order updated successfully",
        "order": {
            "id": order.id,
            "waiter_name": order.waiter_name,
            "table_number": order.table_number,
            "status": order.status,
            "total_amount": order.total_amount,
            "updated_at": order.updated_at.isoformat()
        }
    })

@app.route('/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    
    if not user or user.role != 'manager':
        return jsonify({"success": False, "message": "Unauthorized access"}), 403
    
    order = Order.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": f"Order {order_id} deleted successfully"
    })

if __name__ == '__main__':
    with app.app_context():
        create_manager()  # Ensure manager is created when the app starts
        db.create_all()  # Create all tables
    app.run(debug=True)