extends RigidBody2D

# Height threshold and gravity settings
const MAX_HEIGHT := 400.0  # Height above which extra gravity kicks in
const NORMAL_GRAVITY_SCALE := 1.0  # Normal gravity (1.0 = default)
const HIGH_GRAVITY_SCALE := 2.5  # Increased gravity when too high (2.5 = 2.5x faster fall)

var ground_level: float = 0.0  # Track starting ground position

func _ready() -> void:
	# Store initial position as ground level
	ground_level = global_position.y
	
	# Create bounce material
	var mat = PhysicsMaterial.new()
	mat.bounce = 0.8
	mat.friction = 0.3
	physics_material_override = mat
	
	# Reduce damping to prevent energy loss
	angular_damp = 0.0
	linear_damp = 0.0
	
	# Give ball a push to start
	apply_impulse(Vector2(0, -300))

func _physics_process(delta: float) -> void:
	_apply_dynamic_gravity()

# Apply stronger gravity when ball goes too high
func _apply_dynamic_gravity() -> void:
	# Calculate current height (ground_y - current_y, since Y decreases going up)
	var current_height = ground_level - global_position.y
	
	# If ball is too high, apply stronger gravity
	if current_height > MAX_HEIGHT:
		gravity_scale = HIGH_GRAVITY_SCALE
	else:
		gravity_scale = NORMAL_GRAVITY_SCALE
	
	# Optional: Update ground level when ball is near the ground
	if global_position.y > ground_level - 50:  # Within 50 pixels of ground
		ground_level = global_position.y
