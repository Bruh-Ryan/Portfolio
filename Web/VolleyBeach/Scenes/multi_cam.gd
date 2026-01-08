extends Camera2D

# Camera settings
@export var move_speed := 2.0  # How fast camera moves to center
@export var zoom_speed := 2.0  # How fast camera zooms
@export var min_zoom := 0.02  # Maximum zoom in (closer)
@export var max_zoom := 1  # waMaximum zoom out (farther)
@export var margin := Vector2(960, 540)  # Buffer space around targets


# Targets to track
var targets = []  # Will hold player1, player2, and ball

# Track ball separately for out-of-bounds check
var ball_node: Node2D = null
var track_ball := true  # Toggle to stop tracking ball when out of bounds

func _ready() -> void:
	# Get references to your game objects - adjust paths as needed
	var player1 = get_node_or_null("../Players1_R")
	var player2 = get_node_or_null("../Player2_L")
	ball_node = get_node_or_null("../Ball")
	
	# Add players to targets (always track)
	if player1:
		targets.append(player1)
	if player2:
		targets.append(player2)
	
	# Set camera limits
	limit_left = limit_left
	limit_right = limit_right
	limit_top = limit_top
	limit_bottom = limit_bottom

func _process(delta: float) -> void:
	# Check if ball is in bounds
	if ball_node:
		_check_ball_bounds()
	
	# Build current targets list
	var current_targets = targets.duplicate()
	if ball_node and track_ball:
		current_targets.append(ball_node)
	
	if current_targets.is_empty():
		return
	
	# Calculate center position of all targets
	var target_center = _get_targets_center(current_targets)
	
	# Smoothly move camera to center
	global_position = global_position.lerp(target_center, move_speed * delta)
	
	# Calculate required zoom to fit all targets
	var target_zoom = _calculate_zoom(current_targets)
	
	# Smoothly adjust zoom
	zoom = zoom.lerp(Vector2.ONE * target_zoom, zoom_speed * delta)

# Get center point of all targets
func _get_targets_center(target_list: Array) -> Vector2:
	var center = Vector2.ZERO
	for target in target_list:
		center += target.global_position
	return center / target_list.size()

# Calculate zoom level to fit all targets
func _calculate_zoom(target_list: Array) -> float:
	if target_list.size() == 1:
		return 1.0  # Default zoom for single target
	
	# Create bounding rectangle containing all targets
	var rect = Rect2(target_list[0].global_position, Vector2.ONE)
	for target in target_list:
		rect = rect.expand(target.global_position)
	
	# Add margin/buffer space
	rect = rect.grow_individual(margin.x, margin.y, margin.x, margin.y)
	
	# Get viewport size
	var viewport_size = get_viewport_rect().size
	
	# Calculate zoom needed to fit rectangle in viewport
	var zoom_x = viewport_size.x / rect.size.x
	var zoom_y = viewport_size.y / rect.size.y
	
	# Use smaller zoom (shows more) to fit both dimensions
	var calculated_zoom = min(zoom_x, zoom_y)
	
	# Clamp zoom to min/max limits
	return clamp(calculated_zoom, min_zoom, max_zoom)

# Check if ball is within game bounds
func _check_ball_bounds() -> void:
	var ball_pos = ball_node.global_position
	
	# Define your play area bounds (adjust these values)
	var play_area_left = 0
	var play_area_right = 1920
	var play_area_top = -100  # Allow some space above
	var play_area_bottom = 1200  # Allow some space below
	
	# Stop tracking ball if it goes out of bounds
	if ball_pos.x < play_area_left or ball_pos.x > play_area_right or \
	   ball_pos.y < play_area_top or ball_pos.y > play_area_bottom:
		track_ball = false
	else:
		track_ball = true
