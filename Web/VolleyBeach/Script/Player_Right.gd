extends CharacterBody2D
##player GD RIGHT
const sp_unit=1000.0
const JUMP_VELOCITY := -900.0
const SPEED := sp_unit*2
const MAX_JUMP_HEIGHT := 600.0  # Maximum height limit from ground

enum States { IDLE, JUMPING }
var state: States = States.IDLE
var ground_y_position: float = 0.0  # Store ground level
##doesnt work gotta do this diffrent way, like layers use
@onready var animated_sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var hit_area: Area2D = $Hit_area
@onready var spawn_marker: Marker2D = $Spawn_Marker

# Hit settings
const SPIKE_FORCE := 600.0
const NORMAL_HIT_FORCE_for_Z2 := 300.0
const NORMAL_HIT_FORCE_for_Z1 := 200.0
const PASSIVE_PUSH_FORCE := 50.0

# Ball spawning
const SPAWN_JUMP_FORCE := 300.0
var ball_scene = preload("res://Scenes/Ball.tscn")

# Zone references
@onready var zone_1: Area2D = $"../zones/zone_1"
@onready var zone_2_L: Area2D = $"../zones/zone_2_L"
@onready var zone_2_R: Area2D = $"../zones/zone_2_R"

func _ready() -> void:
	# Store initial ground position
	ground_y_position = global_position.y

func _physics_process(delta: float) -> void:
	_apply_gravity(delta)
	_handle_inputs()
	_handle_ball_spawn()
	_handle_passive_ball_push()
	_handle_ball_hit()
	_check_player_not_out_of_bounds()  # Add this check
	_update_animation()
	move_and_slide()

func _apply_gravity(delta: float) -> void:
	if not is_on_floor():
		velocity.y += get_gravity().y * delta

func _handle_inputs() -> void:
	if Input.is_action_just_pressed("arrow_jump") and is_on_floor():
		velocity.y = JUMP_VELOCITY
		state = States.JUMPING
		ground_y_position = global_position.y  # Update ground level on jump

	var direction := Input.get_axis("arrow_left", "arrow_right")
	if direction:
		velocity.x = direction * SPEED
	else:
		velocity.x = move_toward(velocity.x, 0, SPEED)
	
	if is_on_floor() and state == States.JUMPING:
		state = States.IDLE
		ground_y_position = global_position.y  # Update ground level on landing

func _handle_ball_spawn() -> void:
	if Input.is_action_just_pressed("spawn_ball_R"):
		_spawn_ball()

func _handle_passive_ball_push():
	for i in get_slide_collision_count():
		var collision = get_slide_collision(i)
		var collider = collision.get_collider()
		
		# Check if colliding with ball
		if collider is RigidBody2D and collider.name == "Ball":
			# Get which collision shape on the player was hit
			var local_shape = collision.get_local_shape()
			
			# Only push if ball hit the "Head" collision shape
			if local_shape != null and local_shape.get_parent().name == "Head":
				var push_direction = Vector2(0, -1)  # Straight up
				collider.apply_central_impulse(push_direction * PASSIVE_PUSH_FORCE)


func _spawn_ball() -> void:
	var existing_balls = get_tree().get_nodes_in_group("ball")
	for old_ball in existing_balls:
		old_ball.queue_free()
	
	var direct_ball = get_node_or_null("../Ball")
	if direct_ball and direct_ball.is_queued_for_deletion() == false:
		direct_ball.queue_free()
	
	await get_tree().process_frame
	
	var ball = ball_scene.instantiate()
	ball.name = "Ball"
	ball.add_to_group("ball")
	
	if spawn_marker:
		ball.global_position = spawn_marker.global_position
	else:
		ball.global_position = global_position + Vector2(0, -100)
	
	get_parent().add_child(ball)
	await get_tree().process_frame
	
	if ball and is_instance_valid(ball):
		ball.apply_central_impulse(Vector2(0, -SPAWN_JUMP_FORCE))

func _handle_ball_hit() -> void:
	if hit_area == null:
		return
		
	if Input.is_action_just_pressed("trigger_action_ball_?"):
		var balls = hit_area.get_overlapping_bodies()
		
		for body in balls:
			if body is RigidBody2D and body.name == "Ball":
				_hit_ball(body)

func _hit_ball(ball: RigidBody2D) -> void:
	if not is_on_floor():
		if _is_in_zone(zone_1):
			var spike_direction = Vector2.from_angle(deg_to_rad(-200))  
			ball.apply_central_impulse(spike_direction * SPIKE_FORCE)
		elif _is_in_zone(zone_2_R):
			var spike_direction = Vector2.from_angle(deg_to_rad(-160))  
			ball.apply_central_impulse(spike_direction * SPIKE_FORCE)
	else:
		var hit_direction: Vector2
		
		if _is_in_zone(zone_1):
			hit_direction = Vector2.from_angle(deg_to_rad(-100))  
			ball.apply_central_impulse(hit_direction * NORMAL_HIT_FORCE_for_Z1)
		elif _is_in_zone(zone_2_R):
			hit_direction = Vector2.from_angle(deg_to_rad(-120))
			ball.apply_central_impulse(hit_direction * NORMAL_HIT_FORCE_for_Z2)
		else:
			hit_direction = Vector2.from_angle(deg_to_rad(-120))
			ball.apply_central_impulse(hit_direction * NORMAL_HIT_FORCE_for_Z2)

func _is_in_zone(zone: Area2D) -> bool:
	if zone == null:
		return false
	var bodies = zone.get_overlapping_bodies()
	return self in bodies

func _update_animation() -> void:
	if not is_on_floor():
		animated_sprite.play("jump_action")
	else:
		animated_sprite.play("idle")

# Prevent player from jumping higher than 600 units
func _check_player_not_out_of_bounds():
	if not is_on_floor():
		# Calculate current jump height (ground_y - current_y, since Y decreases going up)
		var current_height = ground_y_position - global_position.y
		
		# If exceeded max jump height
		if current_height > MAX_JUMP_HEIGHT:
			# Clamp player position to max height
			global_position.y = ground_y_position - MAX_JUMP_HEIGHT
			
			# Stop upward velocity (negative Y velocity = moving up)
			if velocity.y < 0:
				velocity.y = 0
